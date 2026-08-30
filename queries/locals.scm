; Scopes
(block) @local.scope
(function_declaration) @local.scope
(test_declaration) @local.scope
(for_statement) @local.scope
(while_statement) @local.scope
(if_expression) @local.scope

; Definitions
(let_statement
  name: (identifier) @local.definition)
(var_statement
  name: (identifier) @local.definition)
(parameter
  name: (identifier) @local.definition)
(static_parameter
  name: (identifier) @local.definition)
(payload_capture
  name: (identifier) @local.definition)
(variant_capture
  variant: (identifier) @local.definition)
(variant_capture
  payload: (identifier) @local.definition)
(constructor_pattern
  binding: (identifier) @local.definition)

; References
(identifier) @local.reference
