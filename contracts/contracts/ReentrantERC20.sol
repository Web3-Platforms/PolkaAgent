// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IAegisVault {
    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
}

contract ReentrantERC20 is ERC20 {
    enum AttackType {
        None,
        Deposit,
        Withdraw
    }

    address public vault;
    uint256 public attackAmount;
    AttackType public attackType;
    bool private hasAttacked;

    constructor() ERC20("Reentrant Token", "RNT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function armDepositAttack(address vaultAddress, uint256 reentryAmount) external {
        vault = vaultAddress;
        attackAmount = reentryAmount;
        attackType = AttackType.Deposit;
        hasAttacked = false;

        _mint(address(this), reentryAmount);
        _approve(address(this), vaultAddress, type(uint256).max);
    }

    function seedAndArmWithdrawAttack(
        address vaultAddress,
        uint256 seedAmount,
        uint256 reentryAmount
    ) external {
        vault = vaultAddress;
        attackAmount = reentryAmount;
        attackType = AttackType.None;
        hasAttacked = false;

        _mint(address(this), seedAmount);
        _approve(address(this), vaultAddress, type(uint256).max);
        IAegisVault(vaultAddress).deposit(address(this), seedAmount);

        hasAttacked = false;
        attackType = AttackType.Withdraw;
    }

    function attackWithdraw(uint256 amount) external {
        IAegisVault(vault).withdraw(address(this), amount);
    }

    function transfer(address to, uint256 value) public override returns (bool) {
        bool success = super.transfer(to, value);
        _attemptReentrancy();
        return success;
    }

    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        bool success = super.transferFrom(from, to, value);
        _attemptReentrancy();
        return success;
    }

    function _attemptReentrancy() private {
        if (vault == address(0) || hasAttacked || msg.sender != vault) {
            return;
        }

        hasAttacked = true;

        if (attackType == AttackType.Deposit) {
            IAegisVault(vault).deposit(address(this), attackAmount);
        } else if (attackType == AttackType.Withdraw) {
            IAegisVault(vault).withdraw(address(this), attackAmount);
        }
    }
}
