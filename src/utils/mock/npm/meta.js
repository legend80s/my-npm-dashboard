import { sleep } from "../../light-lodash.js"

/**
 * https://registry.npmjs.org/`{nam`}
 * @param {string} name
 * @returns
 */
export const getMetaByName = async (name) => {
  await sleep(1000)
  return {
    _id: name,
    _rev: "9-987dd9b5249abc4f640e40a36f4f722e",
    name: name,
    "dist-tags": {
      latest: "1.1.2",
    },
    versions: {
      "0.0.2": {
        name: name,
        version: "0.0.2",
        keywords: [
          "sse",
          "stuntman",
          "mock",
          "ai",
          "streaming",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@0.0.2`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "06ab4b08095842e7ca1a61f33be3a0c9586d4181",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-0.0.2.tgz`,
          fileCount: 37,
          integrity:
            "sha512-HldSoUX+pQBN1RDUXgm16oRRrAPC1GWYZJVXFLk8Qde/RzR++4N+lsC8xey2NGano8+DXm4AKxiecBYRl/Iv5g==",
          signatures: [
            {
              sig: "MEUCIQD0oYy/LjWnY4gV3s4azXXDF8RTrrCbV0EiLs6vp6M/6wIgMJt9GpXZmgoMcHzbtmn6ImRaw4zJhMei5P+ezSHKMDU=",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 166619,
        },
        type: "module",
        gitHead: "85e0c1207ca2e1b9b2513075f7161cb1b769296e",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Stuntman — stunt double for your AI API. Simulate streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_0.0.2_1782789515720_0.03397254813025086`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "0.0.3": {
        name: name,
        version: "0.0.3",
        keywords: [
          "sse",
          "stuntman",
          "mock",
          "ai",
          "streaming",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@0.0.3`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "a47bad5a00f128e63f6c3a1dda988a82f119ff87",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-0.0.3.tgz`,
          fileCount: 38,
          integrity:
            "sha512-stsk0uaKiUKXLKB/cyhCZZH4YdcNnmljZGXqKCF+NzdVqPoa4x4FVYSIHaN59zriy82lXp8AR9LHlCylpp3wNw==",
          signatures: [
            {
              sig: "MEYCIQDU8+PreWvSx1cMofDjus/NLEIGHYRHqvb/PaNSXar5WAIhAJlb5ZxzBnaKFk/tpYqZHD70AMO2OEgezzZy1z+IDGjF",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 169814,
        },
        type: "module",
        gitHead: "861ec10de55a444d0f41e1411f4589998d7584f0",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Stuntman — stunt double for your AI API. Simulate streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_0.0.3_1782791489169_0.1609061717615088`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "0.0.4": {
        name: name,
        version: "0.0.4",
        keywords: [
          "sse",
          "stuntman",
          "mock",
          "ai",
          "streaming",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@0.0.4`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "763eeedb73fbb3386c02083864176a528d2be178",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-0.0.4.tgz`,
          fileCount: 39,
          integrity:
            "sha512-yuoiEnFangSuaTUXw73BiruTK3MjClnfdq1r1Yf+oMk7eIcIZhTQbzYIi7ZIzWcf1ON9HeufcsTz7/mVu+Rk2w==",
          signatures: [
            {
              sig: "MEYCIQD501G6VF6tyIdq5cxCD4gtl0mZtwjM51dcTtzJUMpBdwIhAON+F1X4FOYGhhZKM+ChRhCrjJALjTSyTrVShuWwYTAO",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 168349,
        },
        type: "module",
        gitHead: "7f6fd0769ad46f5000cf9fe7e1c9da013fe1c5bb",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Stuntman — stunt double for your AI API. Simulate streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_0.0.4_1782807123149_0.41123914401985795`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "0.0.5": {
        name: name,
        version: "0.0.5",
        keywords: [
          "sse",
          "stuntman",
          "mock",
          "ai",
          "streaming",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@0.0.5`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "42adb7fb38d327925d626353639510f8ca9d8c97",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-0.0.5.tgz`,
          fileCount: 39,
          integrity:
            "sha512-MYQlvT0sXWdcb+IBE2nHrT5NAL1M5Qjkm+QlLwE9n1K7aMXV9iBVKULELfiI+PeR3JUICEt9tuz5eOVh09ULKA==",
          signatures: [
            {
              sig: "MEUCIQCb+d5AMqZCaoh3OUaEyjoWJony+vdwDQpaf3orhpb39gIgVXMR5N4PJJBzNmnzc3DwLpb74g8FqDSP3ArpJV91S50=",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 168667,
        },
        type: "module",
        gitHead: "6d337c2b52e20f9cef5044d2b8a4686a9487328c",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Stuntman — stunt double for your AI API. Simulate streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_0.0.5_1782807911126_0.43560295157325557`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "0.0.6": {
        name: name,
        version: "0.0.6",
        keywords: [
          "sse",
          "mock",
          "ai",
          "streaming",
          "anthropic",
          "simulate",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@0.0.6`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "6673dbd15c9ab7ac090d3aed28a9d541109d4229",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-0.0.6.tgz`,
          fileCount: 41,
          integrity:
            "sha512-y3mqmQkuEsW5yL/V5/js2fZKv+00fXhh0xJzBC7Sc03rN0BGXw9mF3ZrX6LXl5jOjfqDVwQnOHxl5DI+zWxCvA==",
          signatures: [
            {
              sig: "MEYCIQDZ9cAoobZI3vLN9p7ndYs0dA7zE+UCGaeRu1jLHiiUqAIhAOt4PLXghy74A/mg8fO3QvH9muSm/+4kbsbAUBpIE/DK",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 200055,
        },
        type: "module",
        gitHead: "eb70b06b58468de2d37167f1c374bb01cc441f0e",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          coverage:
            'node --test --experimental-test-coverage --test-coverage-exclude="src/**/*.test.mjs" --test-reporter=tap',
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Mock — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_0.0.6_1782963022467_0.04581274942727598`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "1.0.0": {
        name: name,
        version: "1.0.0",
        keywords: [
          "sse",
          "mock",
          "ai",
          "streaming",
          "anthropic",
          "simulate",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@1.0.0`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "fc397902b6db7c89d05c113df9b166c0d6506821",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-1.0.0.tgz`,
          fileCount: 41,
          integrity:
            "sha512-LCHzzuy1CwLZloxdIT2qy8mRNYZtMwPhxESdXK0viiOthm2JABS2aV8X67FF7DpHNhDTfpynW7e8eA1P8AwM7Q==",
          signatures: [
            {
              sig: "MEQCIFZ0FQTApKFVVpbjBlCJi1kJ+gysOP+TVLdehixXRf0NAiBQ88Cn144TLyA4MCwliIUzQsDQUp6GUsFKuT0Dp9aRBw==",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 206456,
        },
        type: "module",
        gitHead: "9f3e57117764b606c4c71094e52c1d0c87794cb4",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          coverage:
            'node --test --experimental-test-coverage --test-coverage-exclude="src/**/*.test.mjs" --test-reporter=tap',
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Mock — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_1.0.0_1782979738559_0.5622329820827983`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "1.1.0": {
        name: name,
        version: "1.1.0",
        keywords: [
          "sse",
          "mock",
          "ai",
          "streaming",
          "anthropic",
          "simulate",
          "openai",
          "test",
          "testing",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@1.1.0`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "6a448e726c40faaa65b245fe65ebc190ba6526ae",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-1.1.0.tgz`,
          fileCount: 42,
          integrity:
            "sha512-bWaBn90R6thu1tlIgvA7FHzAnKQZ3KUAjxHZBp7B0t1v8GSnBZQaP7TMCMu+P6yCHvGvcylCFVRFmQgnh3ewkg==",
          signatures: [
            {
              sig: "MEYCIQCBYUsCYLlcY0PPPhF4HLcEgda9zOb4iXz6OJ3IVLw8mQIhANN1dZmrH4MSJrRPac7POZ+UAcK1YDCYSoNwC+GZP+0n",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 209168,
        },
        main: "index.mjs",
        type: "module",
        gitHead: "73ce0514e8295649cc6fc2c6b9054ea47b59b11e",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          coverage:
            'node --test --experimental-test-coverage --test-coverage-exclude="src/**/*.test.mjs" --test-reporter=tap',
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "SSE Mock — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_1.1.0_1783070442105_0.9182530405199067`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "1.1.1": {
        name: name,
        version: "1.1.1",
        keywords: [
          "mock",
          "sse",
          "streaming",
          "ai",
          "test",
          "testing",
          "anthropic",
          "simulate",
          "openai",
        ],
        author: "",
        license: "MIT",
        _id: `${name}@1.1.1`,
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        homepage: `https://github.com/legend80s/${name}#readme`,
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        dist: {
          shasum: "2ac82ac65102d552607ef352ea89948dbb9804ca",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-1.1.1.tgz`,
          fileCount: 43,
          integrity:
            "sha512-vzgD3CX0hmN/gMPhIzqXPUpXc8rMKI1UF8hEYuWIasqf36tdchr9BGnCwWuCf7NWxccZIH0AQ/iwKtcnjKQ1MA==",
          signatures: [
            {
              sig: "MEQCID6hi0C+gq1NMU7sXqc1Ov+0OZt6q7bwnDb17xgcbdGUAiBrSQ5CkX4nimxXb6lXLq7otpAOZjdCI4sb1qWcqAD7Jw==",
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
            },
          ],
          unpackedSize: 214463,
        },
        main: "index.mjs",
        type: "module",
        gitHead: "6f787b0dc8fbf83e3d5ced166b093f13e44fe8b0",
        scripts: {
          test: "node --test",
          start: "node bin/index.mjs",
          coverage:
            'node --test --experimental-test-coverage --test-coverage-exclude="src/**/*.test.mjs" --test-reporter=tap',
          "pub:major": "npm version major",
          "pub:minor": "npm version minor",
          "pub:patch": "npm version patch",
          typecheck: "tsgo --noEmit",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        repository: {
          url: `git+https://github.com/legend80s/${name}.git`,
          type: "git",
        },
        _npmVersion: "11.7.0",
        description:
          "Mock SSE — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
        directories: {},
        _nodeVersion: "22.18.0",
        _hasShrinkwrap: false,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        _npmOperationalInternal: {
          tmp: `tmp/${name}_1.1.1_1783491902125_0.8043292203269936`,
          host: "s3://npm-registry-packages-npm-production",
        },
      },
      "1.1.2": {
        name: name,
        version: "1.1.2",
        description:
          "Mock SSE — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
        type: "module",
        main: "index.mjs",
        scripts: {
          "pub:patch": "npm version patch",
          "pub:minor": "npm version minor",
          "pub:major": "npm version major",
          preversion: "npm test && npm run typecheck",
          postversion: "npm publish && git push && git push --tags",
          typecheck: "tsgo --noEmit",
          start: "node bin/index.mjs",
          coverage:
            'node --test --experimental-test-coverage --test-coverage-exclude="src/**/*.test.mjs" --test-reporter=tap',
          test: "node --test",
        },
        bin: {
          name: "src/bin/index.mjs",
        },
        repository: {
          type: "git",
          url: `git+https://github.com/legend80s/${name}.gi`,
        },
        keywords: [
          "mock",
          "sse",
          "streaming",
          "ai",
          "test",
          "testing",
          "anthropic",
          "simulate",
          "openai",
        ],
        author: "",
        license: "MIT",
        bugs: {
          url: `https://github.com/legend80s/${name}/issue`,
        },
        homepage: `https://github.com/legend80s/${name}#readme`,
        devDependencies: {
          "@types/node": "^26.0.1",
        },
        gitHead: "c543a91bb62aaf153c6fffd615304d1ffbe22277",
        _id: `${name}@1.1.2`,
        _nodeVersion: "22.18.0",
        _npmVersion: "11.7.0",
        dist: {
          integrity:
            "sha512-PzIXqASihGt6yvuQmLcqXugyf6T2s6YMysU5rODIvWSEAHmZvWdoR/8iGnmtyRhupcEZvUknk64PXOp0FQd+hg==",
          shasum: "3af6a3588fff4fc9765bf2e40b43939d9e13e4cf",
          tarball: `https://registry.npmjs.org/${name}/-/${name}-1.1.2.tgz`,
          fileCount: 44,
          unpackedSize: 220756,
          signatures: [
            {
              keyid: "SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U",
              sig: "MEQCIGODglcZbWwX10FRmxwiNUWy43D+gWf9j4ORoCGdkwW2AiBugwkVRFEJH7jPDNoIhjixpM/t87mD9Ym5x/WGzSX+wA==",
            },
          ],
        },
        _npmUser: {
          name: "legend80s",
          email: "liuchzong@qq.com",
        },
        directories: {},
        maintainers: [
          {
            name: "legend80s",
            email: "liuchzong@qq.com",
          },
        ],
        _npmOperationalInternal: {
          host: "s3://npm-registry-packages-npm-production",
          tmp: `tmp/${name}_1.1.2_1784031184789_0.596356391477587`,
        },
        _hasShrinkwrap: false,
      },
    },
    time: {
      created: "2026-06-30T03:18:35.672Z",
      modified: "2026-07-14T12:13:05.024Z",
      "0.0.2": "2026-06-30T03:18:35.861Z",
      "0.0.3": "2026-06-30T03:51:29.306Z",
      "0.0.4": "2026-06-30T08:12:03.289Z",
      "0.0.5": "2026-06-30T08:25:11.293Z",
      "0.0.6": "2026-07-02T03:30:22.613Z",
      "1.0.0": "2026-07-02T08:08:58.699Z",
      "1.1.0": "2026-07-03T09:20:42.235Z",
      "1.1.1": "2026-07-08T06:25:02.287Z",
      "1.1.2": "2026-07-14T12:13:04.919Z",
    },
    bugs: {
      url: `https://github.com/legend80s/${name}/issue`,
    },
    license: "MIT",
    homepage: `https://github.com/legend80s/${name}#readme`,
    keywords: [
      "mock",
      "sse",
      "streaming",
      "ai",
      "test",
      "testing",
      "anthropic",
      "simulate",
      "openai",
    ],
    repository: {
      type: "git",
      url: `git+https://github.com/legend80s/${name}.gi`,
    },
    description:
      "Mock SSE — stunt double for your AI API. Mock streaming responses, errors, and edge cases.",
    maintainers: [
      {
        name: "legend80s",
        email: "liuchzong@qq.com",
      },
    ],
    readme:
      '# SSE Stuntman 🏍️ AI SSE Stream 测试工具\n\n<div>\n\n  [![NPM Version]`https://img.shields.io/npm/v/${name}.svg?logo=npm&logoColor=cyan`]`https://www.npmjs.com/package/${name})\n  [![0 dependencies](https://img.shields.io/badge/0-green?logo=npm&logoColor=212121&labelColor=ffc44`&label=dependencies&color=green&color=212121)]`https://www.npmjs.com/package/${name}?activeTab=dependencies)\n  [![NPM Downloads]`https://img.shields.io/np`/dm/${name}.svg?logo=npm&logoColor=cyan)]`https://www.npmjs.com/package/${name})\n  ![coverage](https://img.shields.io/badge/95.8%25-green?logo=counterstrik`&logoColor=cyan&label=coverage&color=green&color=212121)\n</div>\n\n```md\n╔═══════════════════════════════════════════════════╗\n║   ███████╗████████╗██╗   ██╗███╗   ██╗████████╗   ║\n║   ██╔════╝╚══██╔══╝██║   ██║████╗  ██║╚══██╔══╝   ║\n║   ███████╗   ██║   ██║   ██║██╔██╗ ██║   ██║      ║\n║   ╚════██║   ██║   ██║   ██║██║╚██╗██║   ██║      ║\n║   ███████║   ██║   ╚██████╔╝██║ ╚████║   ██║      ║\n║   ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝   ╚═╝      ║\n║                                                   ║\n║     SSE Stuntman  |  Your AI\'s Stunt Double       ║\n╚═══════════════════════════════════════════════════╝\n\n✓ OpenAI provider ready\n✓ SSE endpoint: http://localhost:16828\n```\n\n[English](./README.md) | 中文\n\n> **特技替身 (Stuntman) — 替真实 AI API 完成"危险"的测试任务**\n>\n> 前端开发时，如何快速测试 AI 流式输出的打字机效果？\n>\n> 一键启动 `${name}`，无需真` API Key，即可模拟各种场景：\n>\n> 正常的 Markdown 流式输出、表格/代码块/Mermaid 图表、HTTP 错误、超时断连……\n\n## 快速开始\n\n```bash\nnpx ${name} --default-dela` 100 --scenario echo\n# 🏍️  SSE Stuntman — server ready at http://localhost:16828\n```\n\n```bash\ncurl -N -X POST http://localhost:16828/v1/chat/completions \\\n    -H "Content-Type: application/json" \\\n    -d \'{"messages":[{"role":"user","content":"# Hello\\n\\nYour **markdown** here"}],"stream": true}\'\n```\n\n### 使用\n\n假设有一个 `POST http://localhost:9095/api/my/chat` SSE 请求，期待返回 OpenAI 标准格式的 Markdown 流式输出，前端想测试该接口：\n\n```bash\nnpx ${name} --port 9095 --endpoint-path \'api/my/chat\'\n```\n\n这样就开启了一个 SSE 请求模拟服务，你可以直接在你的代码中发起请求。可`试试 curl 看看是否输出了你预期的格式:\n\n```bash\ncurl -N -X POST http://localhost:9095/api/my/chat \\\n  -H "Content-Type: application/json" \\\n  -d \'{ "model": "gpt-5.5", "stream": true, "messages": [] }\'\n```\n\n## CLI 命令常用参数\n\n```bash\n${name} -h\n```\n\n| 参数 | 默认值 | 说明 |\n| ------ ` -------- | ------ |\n| `--port <number>` | `16828` | 服务端口 |\n| `--scenario <name>` | `default` | 场景名或 `.md` 文件路径（支持绝对/相对路径） |\n| `--delay-multiplier <number>` | `1` | 全局延迟倍率（`0.5` 半速，`2` 倍速） |\n| `--default-delay <number>` / `-d` | `10` | 场景内无 `@delay` 时的默认 chunk 间隔（毫秒） |\n| `--model <name>` | `gpt-4o` | SSE 事件中的模型名 |\n| `--endpoint-path <path>` / `-e` | `/v1/chat/completions` | 自定义 POST 端点路径，可多次指定支持多路径（如 `-e /chat -e /api/chat`） |\n| `--provider <name>` | `openai` | 输出格式：`openai`（Chat Completions SSE）或 `anthropic`（Messages SSE） |\n| `--chunk-strategy <name>` | `word` | 文本切分策略：`word` / `sentence` / `char` / `line` / `paragraph` |\n| `--scenarios-dir <path>` | — | 自定义场景目录（覆盖默认路径） |\n| `--list` | — | 列出所有内置 + 自定义场景 |\n| `create-scenario <name>` | — | 创建新场景模板 |\n| `--help` / `-h` | — | 显示帮助 |\n\n### 示例\n\n```bash\n# 启动服务\n${name}\n\n# 查看所有场景\n${name} --list\n\n# 创建自定义场景\n${name} create-scenario my-code-review\n\n# 使用自定义场景\n${name` --scenario my-code-review\n\n# 直接使用 .md 文件作为场景（无需放入场景目录）\n${name} --scenario ./relative/test.md\n\n# 半速输出\n${name} --delay-multiplier 0.5\n\n# 自定义端点路径（用于无法修改代码的客户端）\n${name} --endpoint-path /api/my/chat\n\n# 多个端点路径（同时 mock 多个 URL）\n${name} -e /api/v1/chat -e /api/v2/chat -e /chat\n```\n\n## 特性\n\n- ✨ **零依赖** — 充分使用 Node.js 内置模块\n- 🎯 **OpenAI 兼容** — `POST /v1/chat/completions`，标准 SSE 格式，主流前端 SDK 直接对接\n- ⏱ **灵活时序控制** — 每条消息间隔通过指令可设置不同速度，模拟真实业务效果\n- 💥 **全面错误模拟** — `429` / `400` / `500` / 超时断连 / 空响应，覆盖真实异常\n- 🌐 **CORS 全开** — 浏览器直接跨域调用\n- 🖥 **内置 Web UI** — 浏览器打开首页即可演示流式输出\n- 📝 **场景即 Markdown** — 内置 13 个场景。用 `.md` 文件描述 AI 输出内容和节奏，可读可版本控制，场景文件可放入代码库\n- 📂 **自定义场景** — 默认 `~/.${name}/scenarios/` 放 `.md` 文件自动生效，支持自定义目录，场景可纳入 git 管理\n` 🎤 **自定义输入** — 把请求消息内容注入场景流，用 `@input` 指令让静态场景"活"起来\n\n---\n\n## 开发\n\n```bash\n# 启动服务\nnode --watch --watch-preserve-output src/bin/index.mjs -s english-i-have-a-dream.md -p 16828\n\n# 运行测试（74 个用例）\nnpm test\n\n# 查看场景列表\nnode src/bin/index.mjs --list\n```\n\n## 高级用法\n\n[advance.md](./advance.zh-CN.md) 包括：CLI 命令参数、内置场景、自定义场景、配置文件、前端集成、特殊指令介绍\n\n## License\n\nMIT &copy; 2026 [legend80s](https://github.com/legend80s)\n',
    readmeFilename: "README.zh-CN.md",
  }
}
