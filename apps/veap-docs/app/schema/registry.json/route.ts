export const dynamic = "force-static";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Generated schema for Root",
  type: "object",
  properties: {
    $schema: {
      type: "string",
    },
    name: {
      type: "string",
    },
    version: {
      type: "string",
    },
    description: {
      type: "string",
    },
    homepage: {
      type: "string",
    },
    repository: {
      type: "string",
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          slug: {
            type: "string",
          },
          name: {
            type: "string",
          },
          package: {
            type: "string",
          },
          version: {
            type: "string",
          },
          category: {
            type: "string",
          },
          type: {
            type: "string",
          },
          isNew: {
            type: "boolean",
          },
          featured: {
            type: "boolean",
          },
          status: {
            type: "string",
          },
          hasMigrations: {
            type: "boolean",
          },
          description: {
            type: "string",
          },
          purpose: {
            type: "string",
          },
          installation: {
            type: "object",
            properties: {
              command: {
                type: "string",
              },
              steps: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["command", "steps"],
          },
          dependencies: {
            type: "object",
            properties: {
              core: {
                type: "string",
              },
              veap: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              packages: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["core", "veap", "packages"],
          },
          authors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                role: {
                  type: "string",
                },
                url: {
                  type: "string",
                },
              },
              required: ["name", "role", "url"],
            },
          },
          credits: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                reason: {
                  type: "string",
                },
                url: {
                  type: "string",
                },
              },
              required: ["name", "reason", "url"],
            },
          },
          license: {
            type: "string",
          },
          keepInMind: {
            type: "array",
            items: {
              type: "string",
            },
          },
          contact: {
            type: "object",
            properties: {
              repository: {
                type: "string",
              },
              issues: {
                type: "string",
              },
              website: {
                type: "string",
              },
            },
            required: ["repository", "issues"],
          },
          usage: {
            type: "string",
          },
        },
        required: [
          "id",
          "slug",
          "name",
          "package",
          "version",
          "category",
          "type",
          "isNew",
          "featured",
          "status",
          "hasMigrations",
          "description",
          "purpose",
          "installation",
          "dependencies",
          "authors",
          "license",
          "keepInMind",
          "contact",
          "usage",
        ],
      },
    },
  },
  required: [
    "$schema",
    "name",
    "version",
    "description",
    "homepage",
    "repository",
    "items",
  ],
};

export function GET() {
  return new Response(JSON.stringify(schema, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
