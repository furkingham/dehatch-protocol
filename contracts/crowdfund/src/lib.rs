#![no_std]
//! DeHatch milestone-based crowdfunding.
//!
//! One deployed contract hosts many campaigns, keyed by project slug.
//! Investors send the funding token (USDC) into the contract; the platform admin
//! releases each milestone's share to the project owner, in order, only once the
//! cumulative funding target for that milestone has been reached.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, String, Vec,
};

const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_THRESHOLD: u32 = 30 * DAY_IN_LEDGERS;
const TTL_EXTEND_TO: u32 = 60 * DAY_IN_LEDGERS;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    ProjectExists = 3,
    ProjectNotFound = 4,
    InvalidAmount = 5,
    InvalidMilestones = 6,
    MilestoneNotFound = 7,
    MilestoneNotFunded = 8,
    AlreadyReleased = 9,
    OutOfOrder = 10,
    GoalExceeded = 11,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub amount: i128,
    pub released: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub owner: Address,
    pub goal: i128,
    pub raised: i128,
    pub released: i128,
    pub investors: u32,
    pub milestones: Vec<Milestone>,
}

/// Flat read model for the frontend.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProjectStatus {
    pub owner: Address,
    pub goal: i128,
    pub raised: i128,
    pub released: i128,
    pub investors: u32,
    pub milestones_total: u32,
    pub milestones_released: u32,
}

#[contracttype]
enum DataKey {
    Admin,
    Token,
    Project(String),
    Contribution(String, Address),
}

#[contract]
pub struct Crowdfund;

fn admin(env: &Env) -> Result<Address, Error> {
    env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)
}

fn token_addr(env: &Env) -> Result<Address, Error> {
    env.storage().instance().get(&DataKey::Token).ok_or(Error::NotInitialized)
}

fn load(env: &Env, id: &String) -> Result<Project, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Project(id.clone()))
        .ok_or(Error::ProjectNotFound)
}

fn save(env: &Env, id: &String, p: &Project) {
    let key = DataKey::Project(id.clone());
    env.storage().persistent().set(&key, p);
    env.storage().persistent().extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
}

#[contractimpl]
impl Crowdfund {
    /// One-time setup: platform admin and the funding token (the USDC asset contract).
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
        Ok(())
    }

    /// Admin registers a campaign. `milestone_amounts` are the per-milestone
    /// payouts; their sum is the funding goal.
    pub fn create_project(
        env: Env,
        id: String,
        owner: Address,
        milestone_amounts: Vec<i128>,
    ) -> Result<(), Error> {
        admin(&env)?.require_auth();
        if env.storage().persistent().has(&DataKey::Project(id.clone())) {
            return Err(Error::ProjectExists);
        }
        if milestone_amounts.is_empty() {
            return Err(Error::InvalidMilestones);
        }
        let mut milestones = Vec::new(&env);
        let mut goal: i128 = 0;
        for amount in milestone_amounts.iter() {
            if amount <= 0 {
                return Err(Error::InvalidMilestones);
            }
            goal = goal.checked_add(amount).ok_or(Error::InvalidMilestones)?;
            milestones.push_back(Milestone { amount, released: false });
        }
        save(
            &env,
            &id,
            &Project { owner, goal, raised: 0, released: 0, investors: 0, milestones },
        );
        env.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_EXTEND_TO);
        Ok(())
    }

    /// Investor sends `amount` of the funding token into the campaign escrow.
    pub fn invest(env: Env, project: String, investor: Address, amount: i128) -> Result<(), Error> {
        investor.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let mut p = load(&env, &project)?;
        let new_raised = p.raised.checked_add(amount).ok_or(Error::InvalidAmount)?;
        if new_raised > p.goal {
            return Err(Error::GoalExceeded);
        }

        token::Client::new(&env, &token_addr(&env)?).transfer(
            &investor,
            &env.current_contract_address(),
            &amount,
        );

        let ckey = DataKey::Contribution(project.clone(), investor);
        let prev: i128 = env.storage().persistent().get(&ckey).unwrap_or(0);
        if prev == 0 {
            p.investors += 1;
        }
        env.storage().persistent().set(&ckey, &(prev + amount));
        env.storage().persistent().extend_ttl(&ckey, TTL_THRESHOLD, TTL_EXTEND_TO);

        p.raised = new_raised;
        save(&env, &project, &p);
        Ok(())
    }

    /// Admin releases milestone `index` to the owner. Must be the next unreleased
    /// milestone, and the cumulative funding up to it must be in escrow.
    pub fn release_milestone(env: Env, project: String, index: u32) -> Result<(), Error> {
        admin(&env)?.require_auth();
        let mut p = load(&env, &project)?;
        let mut m = p.milestones.get(index).ok_or(Error::MilestoneNotFound)?;
        if m.released {
            return Err(Error::AlreadyReleased);
        }

        let mut cumulative: i128 = 0;
        for i in 0..=index {
            let prev = p.milestones.get(i).ok_or(Error::MilestoneNotFound)?;
            if i < index && !prev.released {
                return Err(Error::OutOfOrder);
            }
            cumulative += prev.amount;
        }
        if p.raised < cumulative {
            return Err(Error::MilestoneNotFunded);
        }

        token::Client::new(&env, &token_addr(&env)?).transfer(
            &env.current_contract_address(),
            &p.owner,
            &m.amount,
        );

        m.released = true;
        p.released += m.amount;
        p.milestones.set(index, m);
        save(&env, &project, &p);
        Ok(())
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    pub fn get_status(env: Env, project: String) -> Result<ProjectStatus, Error> {
        let p = load(&env, &project)?;
        let mut done = 0u32;
        for m in p.milestones.iter() {
            if m.released {
                done += 1;
            }
        }
        Ok(ProjectStatus {
            owner: p.owner,
            goal: p.goal,
            raised: p.raised,
            released: p.released,
            investors: p.investors,
            milestones_total: p.milestones.len(),
            milestones_released: done,
        })
    }

    pub fn get_milestones(env: Env, project: String) -> Result<Vec<Milestone>, Error> {
        Ok(load(&env, &project)?.milestones)
    }

    pub fn get_contribution(env: Env, project: String, investor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(project, investor))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
