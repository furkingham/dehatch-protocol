#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    vec, Address, Env, String,
};

struct Ctx<'a> {
    env: Env,
    client: CrowdfundClient<'a>,
    token: TokenClient<'a>,
    owner: Address,
    investor: Address,
    id: String,
}

fn setup<'a>() -> Ctx<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let investor = Address::generate(&env);

    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    StellarAssetClient::new(&env, &sac.address()).mint(&investor, &1_000);
    let token = TokenClient::new(&env, &sac.address());

    let client = CrowdfundClient::new(&env, &env.register(Crowdfund, ()));
    client.initialize(&admin, &sac.address());

    let id = String::from_str(&env, "agrochain-ai");
    client.create_project(&id, &owner, &vec![&env, 100, 200, 300]);

    Ctx { env, client, token, owner, investor, id }
}

#[test]
fn invest_updates_status_and_escrows_funds() {
    let c = setup();
    c.client.invest(&c.id, &c.investor, &150);

    let s = c.client.get_status(&c.id);
    assert_eq!(s.goal, 600);
    assert_eq!(s.raised, 150);
    assert_eq!(s.investors, 1);
    assert_eq!(c.client.get_contribution(&c.id, &c.investor), 150);
    assert_eq!(c.token.balance(&c.investor), 850);
    assert_eq!(c.token.balance(&c.client.address), 150);
}

#[test]
fn repeat_investor_counts_once() {
    let c = setup();
    c.client.invest(&c.id, &c.investor, &50);
    c.client.invest(&c.id, &c.investor, &50);
    assert_eq!(c.client.get_status(&c.id).investors, 1);
    assert_eq!(c.client.get_contribution(&c.id, &c.investor), 100);
}

#[test]
fn milestone_releases_to_owner_in_order() {
    let c = setup();
    c.client.invest(&c.id, &c.investor, &300);

    c.client.release_milestone(&c.id, &0);
    c.client.release_milestone(&c.id, &1);
    assert_eq!(c.token.balance(&c.owner), 300);

    let s = c.client.get_status(&c.id);
    assert_eq!(s.milestones_released, 2);
    assert_eq!(s.released, 300);
    assert!(c.client.get_milestones(&c.id).get(0).unwrap().released);
}

#[test]
fn cannot_release_unfunded_or_out_of_order() {
    let c = setup();
    c.client.invest(&c.id, &c.investor, &150);
    // milestone 1 needs 300 cumulative, only 150 raised, and 0 not released yet
    assert_eq!(c.client.try_release_milestone(&c.id, &1), Err(Ok(Error::OutOfOrder)));
    c.client.release_milestone(&c.id, &0);
    assert_eq!(c.client.try_release_milestone(&c.id, &0), Err(Ok(Error::AlreadyReleased)));
    assert_eq!(c.client.try_release_milestone(&c.id, &1), Err(Ok(Error::MilestoneNotFunded)));
}

#[test]
fn rejects_bad_input() {
    let c = setup();
    assert_eq!(c.client.try_invest(&c.id, &c.investor, &0), Err(Ok(Error::InvalidAmount)));
    assert_eq!(c.client.try_invest(&c.id, &c.investor, &601), Err(Ok(Error::GoalExceeded)));
    let unknown = String::from_str(&c.env, "nope");
    assert_eq!(c.client.try_invest(&unknown, &c.investor, &1), Err(Ok(Error::ProjectNotFound)));
    assert_eq!(
        c.client.try_create_project(&c.id, &c.owner, &vec![&c.env, 1]),
        Err(Ok(Error::ProjectExists))
    );
}

#[test]
fn cannot_initialize_twice() {
    let c = setup();
    let a = Address::generate(&c.env);
    assert_eq!(c.client.try_initialize(&a, &a), Err(Ok(Error::AlreadyInitialized)));
}
