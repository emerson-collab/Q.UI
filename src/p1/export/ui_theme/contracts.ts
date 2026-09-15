// Generated deterministically from Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109 (sha256:590e487297c89b1b91a838ac97eae4d309e80db9cc1502e7bbfba55f5560536f).
import type { ResolveUiThemeRequest, ResolveUiThemeResponse } from "./types.ts";

type Obj = Record<string, unknown>;
const TYPE_SCHEMAS: Record<string, unknown> = {
  "ui_theme_artifact": {
    "additionalProperties": false,
    "properties": {
      "content_hash": {
        "pattern": "^sha256:[0-9a-f]{64}$",
        "type": "string"
      },
      "presentation_rules": {
        "additionalProperties": true,
        "type": "object"
      },
      "resolver_capability_ref": {
        "const": "Q.UI.CAPABILITY.UI_THEME@V0109",
        "type": "string"
      },
      "resolver_operation_ref": {
        "const": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/operations/resolve_ui_theme",
        "type": "string"
      },
      "theme_ref": {
        "minLength": 3,
        "pattern": "^.+@V[0-9]{4}$",
        "type": "string"
      },
      "theme_version": {
        "pattern": "^V[0-9]{4}$",
        "type": "string"
      }
    },
    "required": [
      "theme_ref",
      "theme_version",
      "presentation_rules",
      "content_hash",
      "resolver_capability_ref",
      "resolver_operation_ref"
    ],
    "type": "object"
  },
  "ui_theme_material": {
    "additionalProperties": false,
    "properties": {
      "content_hash": {
        "pattern": "^sha256:[0-9a-f]{64}$",
        "type": "string"
      },
      "presentation_rules": {
        "additionalProperties": true,
        "type": "object"
      },
      "theme_ref": {
        "minLength": 3,
        "pattern": "^.+@V[0-9]{4}$",
        "type": "string"
      },
      "theme_version": {
        "pattern": "^V[0-9]{4}$",
        "type": "string"
      }
    },
    "required": [
      "theme_ref",
      "theme_version",
      "presentation_rules",
      "content_hash"
    ],
    "type": "object"
  },
  "ui_theme_selector": {
    "additionalProperties": false,
    "properties": {
      "context_constraints": {
        "additionalProperties": true,
        "type": "object"
      },
      "theme_material": {
        "$ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_material"
      }
    },
    "required": [
      "theme_material"
    ],
    "type": "object"
  }
};
const CONTRACT_SCHEMAS: Record<string, unknown> = {
  "resolve_ui_theme_request_contract": {
    "additionalProperties": false,
    "properties": {
      "theme_selector": {
        "$ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_selector"
      },
      "ui_context": {
        "additionalProperties": true,
        "type": "object"
      },
      "ui_module_artifact_ref": {
        "minLength": 1,
        "type": "string"
      }
    },
    "required": [
      "theme_selector"
    ],
    "type": "object"
  },
  "resolve_ui_theme_response_contract": {
    "additionalProperties": false,
    "properties": {
      "ui_theme_artifact": {
        "$ref": "Q.UI.CONTRACT.CAPABILITY.UI_THEME@V0109#/type_closure/schemas/ui_theme_artifact"
      }
    },
    "required": [
      "ui_theme_artifact"
    ],
    "type": "object"
  }
};
const isObj=(v:unknown):v is Obj=>v!==null&&typeof v==="object"&&!Array.isArray(v);
function eq(a:unknown,b:unknown):boolean{return JSON.stringify(a)===JSON.stringify(b)}
function validate(schema:unknown,value:unknown):boolean{if(!isObj(schema))return false;if(typeof schema.$ref==="string"){const marker="#/type_closure/schemas/",i=schema.$ref.indexOf(marker),key=i<0?"":schema.$ref.slice(i+marker.length);return key in TYPE_SCHEMAS&&validate(TYPE_SCHEMAS[key],value)}if(Array.isArray(schema.enum)&&!schema.enum.some(x=>eq(x,value)))return false;if("const" in schema&&!eq(schema.const,value))return false;const t=schema.type;if(Array.isArray(t)){if(!t.some(x=>validate({...schema,type:x},value)))return false}else if(t==="object"||schema.properties!==undefined){if(!isObj(value))return false;const props=isObj(schema.properties)?schema.properties:{};const required=Array.isArray(schema.required)?schema.required.filter((x):x is string=>typeof x==="string"):[];if(required.some(k=>!(k in value)))return false;if(schema.additionalProperties===false&&Object.keys(value).some(k=>!(k in props)))return false;for(const [k,sub] of Object.entries(props))if(k in value&&!validate(sub,value[k]))return false;if(typeof schema.minProperties==="number"&&Object.keys(value).length<schema.minProperties)return false;if(typeof schema.maxProperties==="number"&&Object.keys(value).length>schema.maxProperties)return false}else if(t==="array"){if(!Array.isArray(value))return false;if(typeof schema.minItems==="number"&&value.length<schema.minItems)return false;if(typeof schema.maxItems==="number"&&value.length>schema.maxItems)return false;if(schema.items!==undefined&&value.some(x=>!validate(schema.items,x)))return false}else if(t==="string"){if(typeof value!=="string")return false;if(typeof schema.minLength==="number"&&[...value].length<schema.minLength)return false;if(typeof schema.maxLength==="number"&&[...value].length>schema.maxLength)return false;if(typeof schema.pattern==="string"&&!new RegExp(schema.pattern,"u").test(value))return false}else if(t==="number"){if(typeof value!=="number"||!Number.isFinite(value))return false}else if(t==="integer"){if(typeof value!=="number"||!Number.isInteger(value))return false}else if(t==="boolean"){if(typeof value!=="boolean")return false}else if(t==="null"){if(value!==null)return false}if(typeof value==="number"){if(typeof schema.minimum==="number"&&value<schema.minimum)return false;if(typeof schema.maximum==="number"&&value>schema.maximum)return false;if(typeof schema.exclusiveMinimum==="number"&&value<=schema.exclusiveMinimum)return false;if(typeof schema.exclusiveMaximum==="number"&&value>=schema.exclusiveMaximum)return false}return true}
export function is_resolve_ui_theme_request(value: unknown): value is ResolveUiThemeRequest { return validate(CONTRACT_SCHEMAS["resolve_ui_theme_request_contract"], value); }
export function is_resolve_ui_theme_response(value: unknown): value is ResolveUiThemeResponse { return validate(CONTRACT_SCHEMAS["resolve_ui_theme_response_contract"], value); }
