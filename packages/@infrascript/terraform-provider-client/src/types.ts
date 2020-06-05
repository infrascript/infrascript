import {
  ArrayType,
  BooleanType,
  MapType,
  NumberType,
  ObjectProperties,
  ObjectType,
  SchemaType,
  StringType,
  T,
} from '@infrascript/type-system'
import {keysOf} from '@infrascript/types'
import msgpack from 'msgpack'
import {inspect, TextDecoder} from 'util'
import {tfplugin5} from '../generated/client'

export type CtyTypeSchema =
  | 'any'
  | 'bool'
  | 'number'
  | 'string'
  | ['list', CtyTypeSchema]
  | ['map', CtyTypeSchema]
  | ['object', {[key: string]: CtyTypeSchema}]
  | ['set', CtyTypeSchema]

/** Maps from the cty type schema to type system schema */
type CtyToSchemaType<T extends CtyTypeSchema> = T extends 'bool'
  ? BooleanType
  : T extends 'number'
  ? NumberType
  : T extends 'string'
  ? StringType
  : T extends ['list', infer U]
  ? U extends CtyTypeSchema
    ? ArrayType<CtyToSchemaType<U>>
    : never
  : T extends ['map', infer U]
  ? U extends CtyTypeSchema
    ? MapType<CtyToSchemaType<U>>
    : never
  : T extends ['object', infer U]
  ? U extends {[name: string]: CtyTypeSchema}
    ? ObjectType<{[K in keyof U]: CtyToSchemaType<U[K]>}>
    : never
  : T extends ['set', infer U]
  ? U extends CtyTypeSchema
    ? ArrayType<CtyToSchemaType<U>>
    : never
  : never

const decoder = new TextDecoder()
export function decodeCtyType(input: Uint8Array): SchemaType {
  const typeMeta = JSON.parse(decoder.decode(input)) as CtyTypeSchema
  return ctyToType(typeMeta) as SchemaType
}

export function ctyToType<T extends CtyTypeSchema>(schema: T): CtyToSchemaType<T>
export function ctyToType(schema: CtyTypeSchema): SchemaType {
  switch (schema) {
    case 'any':
      throw new Error('unknown type')

    case 'bool':
      return T.boolean()

    case 'number':
      return T.number()

    case 'string':
      return T.string()

    default:
      switch (schema[0]) {
        case 'list':
          return T.array(ctyToType(schema[1]))

        case 'map':
          // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
          return T.map(ctyToType(schema[1]))

        case 'set':
          return T.array(ctyToType(schema[1]))

        case 'object': {
          const innerTypes = keysOf(schema[1]).reduce(
            (types, key) => ({...types, [key]: ctyToType(schema[1][key])}),
            {},
          )
          return T.object(innerTypes)
        }

        default:
          throw new Error(`Unknown type: ${inspect(schema)}`)
      }
  }
}

export function toDynamic(value: unknown): tfplugin5.IDynamicValue {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return {msgpack: msgpack.pack(value)}
}

export function fromDynamic<T = unknown>(value: tfplugin5.IDynamicValue | null | undefined): T | null | undefined {
  if (!value) {
    return value
  }

  if (!value.msgpack) {
    return value.msgpack
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return msgpack.unpack(value.msgpack)
}

export function optionalsToNulls(value: object, schema: ObjectType<ObjectProperties>): Record<string, unknown> {
  return Object.keys(schema.properties).reduce<Record<string, unknown>>((obj, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    obj[key] = (value as Record<string, unknown>)[key] ?? null
    return obj
  }, {})
}

function nestedBlockToSchemaType(nestedBlock: tfplugin5.Schema.INestedBlock): SchemaType {
  if (!nestedBlock.block) {
    throw new Error('Unable to read nested block schema')
  }

  const innerSchema = blockToSchemaType(nestedBlock.block)

  switch (nestedBlock.nesting) {
    case undefined:
    case null:
    case tfplugin5.Schema.NestedBlock.NestingMode.INVALID:
      throw new Error('Invalid nesting mode')

    // Single block
    case tfplugin5.Schema.NestedBlock.NestingMode.SINGLE:
      return innerSchema

    // List of blocks
    case tfplugin5.Schema.NestedBlock.NestingMode.LIST:
      return nestedBlock.maxItems === 1 ? innerSchema : T.array(innerSchema)

    // Set of blocks
    case tfplugin5.Schema.NestedBlock.NestingMode.SET:
      return nestedBlock.maxItems === 1 ? innerSchema : T.array(innerSchema)

    // Map of string to blocks
    case tfplugin5.Schema.NestedBlock.NestingMode.MAP:
      // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
      return T.map(innerSchema)

    // Single item, will be marked as optional
    case tfplugin5.Schema.NestedBlock.NestingMode.GROUP:
      return innerSchema
  }
}

export function blockToSchemaType(block: tfplugin5.Schema.IBlock): ObjectType<ObjectProperties> {
  const schemaAttributes = block.attributes ?? []
  const attrs: ObjectProperties = {}

  for (const attribute of schemaAttributes) {
    if (!attribute.type) {
      throw new Error('Unable to read attribute type')
    }

    if (attribute.name == null) {
      throw new Error('Unable to read attribute name')
    }

    attrs[attribute.name] = decodeCtyType(attribute.type)
    if (attribute.optional) {
      attrs[attribute.name] = T.optional(attrs[attribute.name])
    }
  }

  const schemaBlocks = block.blockTypes ?? []

  for (const nestedBlock of schemaBlocks) {
    if (nestedBlock.typeName == null) {
      throw new Error('Unable to read nested block name')
    }
    if (
      nestedBlock.minItems != null &&
      nestedBlock.minItems > 0 &&
      nestedBlock.nesting !== tfplugin5.Schema.NestedBlock.NestingMode.GROUP
    ) {
      attrs[nestedBlock.typeName] = nestedBlockToSchemaType(nestedBlock)
    } else {
      attrs[nestedBlock.typeName] = T.optional(nestedBlockToSchemaType(nestedBlock))
    }
  }

  return T.object(attrs)
}
