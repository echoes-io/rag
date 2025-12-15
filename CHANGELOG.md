## [1.3.1](https://github.com/echoes-io/rag/compare/v1.3.0...v1.3.1) (2025-12-15)


### Performance Improvements

* :sparkles: Replacing `e5-large` with `EmbeddingGemma` ([3bc82b7](https://github.com/echoes-io/rag/commit/3bc82b7ded3ad7d5e98e670300ac985fe2dae69a))

# [1.3.0](https://github.com/echoes-io/rag/compare/v1.2.0...v1.3.0) (2025-12-15)


### Features

* **kiro:** migrate from Amazon Q to Kiro agent configuration ([6ae6495](https://github.com/echoes-io/rag/commit/6ae6495abaf3959aeded2029e09fdfd00f0ad8b3))
* migrate to LlamaIndexTS + LanceDB with improved architecture ([c353d35](https://github.com/echoes-io/rag/commit/c353d3537f93abc7c448e621b241407764f37324))
* rename agent from 'default' to 'dev' and add code tool ([96ee466](https://github.com/echoes-io/rag/commit/96ee466a1a810d600640b2b84702cd84d7d57ce8))

# [1.2.0](https://github.com/echoes-io/rag/compare/v1.1.3...v1.2.0) (2025-11-03)


### Features

* :sparkles: Added NER ([ed10e7d](https://github.com/echoes-io/rag/commit/ed10e7d3ee272ec981b71e7c45b0674d63be18b1))


### Performance Improvements

* :arrow_up: Upped deps + fixed tests ([0de5e3f](https://github.com/echoes-io/rag/commit/0de5e3f98e9cc8e24a774f069a009c318c61c0eb))
* :zap: Simplify everything ([bfedec5](https://github.com/echoes-io/rag/commit/bfedec5a0a694120c851883f2204fdeee69529ca))

## [1.1.3](https://github.com/echoes-io/rag/compare/v1.1.2...v1.1.3) (2025-10-30)


### Performance Improvements

* :truck: Renamed the default database from `rag_data.db` to `rag.db` ([f55e56b](https://github.com/echoes-io/rag/commit/f55e56bf782260515fdecbf6d4607de384047a8a))

## [1.1.2](https://github.com/echoes-io/rag/compare/v1.1.1...v1.1.2) (2025-10-29)


### Performance Improvements

* :arrow_up: Upped `@echoes-io/models` to allow `episode.number` to be non negative ([06310e3](https://github.com/echoes-io/rag/commit/06310e3ad24b28f951c268e0696b6d7fe0691761))

## [1.1.1](https://github.com/echoes-io/rag/compare/v1.1.0...v1.1.1) (2025-10-28)


### Performance Improvements

* :rotating_light: Better methods to validate ([aedb55d](https://github.com/echoes-io/rag/commit/aedb55dc7e9c20f29acc2e256a2ceb4ed10b7cab))

# [1.1.0](https://github.com/echoes-io/rag/compare/v1.0.0...v1.1.0) (2025-10-28)


### Bug Fixes

* :ambulance: Fixed tests and compile errors ([282d6e7](https://github.com/echoes-io/rag/commit/282d6e734c333aabea4213ca53afe67d6c4320be))


### Features

* :truck: Moved to sqlite ([ee2c11b](https://github.com/echoes-io/rag/commit/ee2c11b856200b37406d92a7629b0894d45e7519))

# 1.0.0 (2025-10-27)


### Features

* :sparkles: Implemented the local + gemini embedding ([d7e5912](https://github.com/echoes-io/rag/commit/d7e5912703c568d0cacba7d6b5e350a0dc650e7e))
* :tada: First draft implementation of the rag system ([e19a63b](https://github.com/echoes-io/rag/commit/e19a63b1c8687bce58c4249c5b36edd40886c708))
