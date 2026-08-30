; Keywords
[
  "fn" "test" "import" "pub" "let" "var" "return" "defer" "errdefer"
  "if" "else" "while" "break" "continue" "match"
  "struct" "enum" "union" "contract" "for"
  "impl" "unsafe" "extern" "comptime" "try" "move"
  "error" "const"
] @keyword

["and" "or" "orelse" "catch"] @keyword.operator

; Literals
(integer_literal) @number
(string_literal) @string
(multiline_string_literal) @string
(boolean_literal) @boolean
(null_literal) @constant.builtin

; Comments
(line_comment) @comment

; Operators
[
  "+" "-" "*" "/" "%" "==" "!=" "<" "<=" ">" ">="
  "=" "->" "=>" ".." "." "::" "!" "&" "?"
] @operator

(deref_expression) @operator

; Delimiters
["(" ")" "{" "}" "[" "]" "|" "," ":" ";"] @punctuation.delimiter

; Function definitions
(function_declaration
  name: (identifier) @function)

(extern_function_declaration
  name: (identifier) @function)

(contract_method
  name: (identifier) @function)

; Function calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (identifier) @function.call))

(call_expression
  function: (namespace_expression
    name: (identifier) @function.call))

(type_application
  function: (identifier) @function.call)

(type_application
  function: (namespace_expression
    name: (identifier) @function.call))

; Type definitions
(struct_declaration
  name: (identifier) @type.definition)
(enum_declaration
  name: (identifier) @type.definition)
(union_declaration
  name: (identifier) @type.definition)
(contract_declaration
  name: (identifier) @type.definition)
(error_set_declaration
  name: (identifier) @type.definition)

; Type references
(named_type (identifier) @type)
(generic_type (identifier) @type)
(pointer_type "ptr" @type.builtin)
(function_type "fn" @type.builtin)

(type_parameters (identifier) @type.parameter)
(static_parameter name: (identifier) @type.parameter)

; Parameters
(parameter
  name: (identifier) @variable.parameter)

; Fields
(field_expression
  field: (identifier) @variable.member)
(struct_field
  name: (identifier) @variable.member)
(field_initializer
  name: (identifier) @variable.member)

; Enum/Union variants
(enum_variant
  name: (identifier) @constant)
(union_variant
  name: (identifier) @constant)
(error_set_member
  name: (identifier) @constant)
(qualified_pattern
  name: (identifier) @constant)

; Namespaces
(namespace_expression
  namespace: (identifier) @module)

; Import paths
(import_path (identifier) @module)

; Labels
(label (identifier) @label)

; Impl
(impl_declaration
  contract: (identifier) @type)
(impl_declaration
  target: (identifier) @type)
