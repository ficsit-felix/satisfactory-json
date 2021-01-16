# Release Instructions

## While developing
Create a draft release on https://github.com/ficsit-felix/satisfactory-json/releases/new
Tag version: `v0.0.0`
Release title: `0.0.0`
Change Target to: `main`
Save as draft
Add changes to draft message

## Release
Switch to `main` branch
Merge `dev` branch
Execute `yarn lint --fix`
Increase version in package.json to `0.0.0`
Commit with name `Release 0.0.0`
Push to main branch
Action will push the package to npm and GitHub packages https://github.com/ficsit-felix/satisfactory-json/actions?query=workflow%3A%22Publish+Node.js+Package%22
Publish the draft commit

## After release
Switch to `dev` branch
Merge `main` branch