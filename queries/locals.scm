; Scopes
(block) @local.scope
(function_declaration) @local.scope
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
(closure_parameters
  (identifier) @local.definition)

; References
(identifier) @local.reference
