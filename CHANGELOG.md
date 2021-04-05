# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### The list

> Clean-up in the repo, removing unused branches, refactoring and, which is more important:
> 
> **Upcoming TS-version release**

---
* Time of the full withdrawal announced the right way: up to 5 hours.
* refactoring: required changes to merge js and TS versions
* fixed push the data-property value from computed property
* simplified a bit deposit.vue
* login loader simplified
* Deposit wrong length of the token decimals fixed
* wallet store refactoring

## 2.1.0 — 2021-02-26

### Added

* added seo meta-data
* zksync version bumped
* changePubKey turned into the record in History of transactions 
* new tx state nomenclature
* imToken update
* two new Vue.filters snippets: full time string and days ago string

### Updated

* refactoring: required changes to merge js and TS versions
* fixed push the data-property value from computed property
* small cleaning of the nuxt.config
* reformatted almost all .vue files
* login loader simplified

### Removed

* dropped unused packages
* failed transactions hidden

### Fixed

* Reported issue with locked transfer button
* fixed mistyped “choosed”
* fixed mistyped “getFormattedTotalPrice”
* Deposit wrong length of the token decimals fixed
* made some visual fixes

## 2.0.4 — 2021-02-11

### Added

* github specials added: issue-templates, libs are updated
* misspelled words where replaced all other the city
* Added proper max withdrawal time indicator  

### Removed

- fast-withdrawal procedure temporary disabled due to the upgrade of the contract and overall size of testing (it will be returned in a short time)
- toaster with errors finally disabled
- sync with the fixed foldouts in Dutch translation
