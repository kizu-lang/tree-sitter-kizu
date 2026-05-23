/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  RANGE: 0,
  OR: 1,
  AND: 2,
  EQUALITY: 3,
  COMPARE: 4,
  SUM: 5,
  PRODUCT: 6,
  PREFIX: 7,
  CALL: 8,
  FIELD: 9,
};

module.exports = grammar({
  name: 'kizu',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  conflicts: $ => [
    [$.named_type, $._expression],
    [$.type_application, $.binary_expression],
    [$.scoped_type, $._expression],
    [$.generic_type, $._expression],
    [$._statement, $._expression],
    [$.binary_expression, $.borrow_expression, $.type_application],
    [$.binary_expression, $.mutable_borrow_expression, $.type_application],
    [$.binary_expression, $.try_expression, $.type_application],
    [$.binary_expression, $.prefix_expression, $.type_application],
    [$._expression, $.struct_literal],
    [$.slice_range, $.range_expression],
  ],

  supertypes: $ => [
    $._expression,
    $._statement,
    $._declaration,
    $._type,
  ],

  rules: {
    source_file: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $._declaration,
      $._statement,
    ),

    // =========================================
    // Comments
    // =========================================

    line_comment: _ => token(seq('//', /.*/)),

    // =========================================
    // Declarations
    // =========================================

    _declaration: $ => choice(
      $.import_declaration,
      $.function_declaration,
      $.extern_function_declaration,
      $.struct_declaration,
      $.enum_declaration,
      $.union_declaration,
      $.contract_declaration,
      $.impl_declaration,
    ),

    import_declaration: $ => seq(
      'import',
      field('path', $.import_path),
      ';',
    ),

    import_path: $ => seq(
      $.identifier,
      repeat(seq('::', $.identifier)),
    ),

    function_declaration: $ => seq(
      repeat($.function_modifier),
      'fn',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameter_list),
      optional(field('return_type', $.return_type)),
      optional(field('borrows', $.borrows_clause)),
      field('body', $.block),
    ),

    extern_function_declaration: $ => seq(
      optional('pub'),
      $.extern_modifier,
      'fn',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameter_list),
      optional(field('return_type', $.return_type)),
    ),

    function_modifier: $ => choice(
      'pub',
      'unsafe',
    ),

    extern_modifier: $ => seq('extern', field('abi', $.string_literal)),

    return_type: $ => seq('->', field('type', $._type)),

    borrows_clause: $ => seq(
      'borrows',
      $.identifier,
      repeat(seq(',', $.identifier)),
    ),

    parameter_list: $ => seq(
      '(',
      optional(seq(
        $.parameter,
        repeat(seq(',', $.parameter)),
        optional(','),
      )),
      ')',
    ),

    parameter: $ => seq(
      optional('comptime'),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    type_parameters: $ => seq(
      '<',
      $.identifier,
      repeat(seq(',', $.identifier)),
      '>',
    ),

    struct_declaration: $ => seq(
      optional('pub'),
      'struct',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      '{',
      optional(seq(
        $.struct_field,
        repeat(seq(',', $.struct_field)),
        optional(','),
      )),
      '}',
    ),

    struct_field: $ => seq(
      optional('pub'),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    enum_declaration: $ => seq(
      optional('pub'),
      'enum',
      field('name', $.identifier),
      '{',
      optional(seq(
        $.enum_variant,
        repeat(seq(',', $.enum_variant)),
        optional(','),
      )),
      '}',
    ),

    enum_variant: $ => field('name', $.identifier),

    union_declaration: $ => seq(
      optional('pub'),
      'union',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      '{',
      optional(seq(
        $.union_variant,
        repeat(seq(',', $.union_variant)),
        optional(','),
      )),
      '}',
    ),

    union_variant: $ => seq(
      field('name', $.identifier),
      optional(seq('(', field('payload', $._type), ')')),
    ),

    contract_declaration: $ => seq(
      optional('pub'),
      'contract',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      '{',
      repeat($.contract_method),
      '}',
    ),

    contract_method: $ => seq(
      'fn',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameter_list),
      optional(field('return_type', $.return_type)),
      ';',
    ),

    impl_declaration: $ => seq(
      'impl',
      choice(
        seq(field('contract', $.identifier), 'for', field('target', $.identifier)),
        field('target', $.identifier),
      ),
      '{',
      repeat($.function_declaration),
      '}',
    ),

    // =========================================
    // Types
    // =========================================

    _type: $ => choice(
      $.named_type,
      $.slice_type,
      $.borrow_type,
      $.pointer_type,
      $.nullable_type,
      $.error_union_type,
      $.dynamic_type,
      $.generic_type,
      $.scoped_type,
    ),

    named_type: $ => $.identifier,

    slice_type: $ => seq('[', ']', $._type),

    borrow_type: $ => seq('&', optional('var'), $._type),

    pointer_type: $ => seq('ptr', '<', optional('const'), $._type, '>'),

    nullable_type: $ => prec(PREC.PREFIX, seq('?', $._type)),

    error_union_type: $ => prec.right(choice(
      seq('!', $._type),
      prec.left(1, seq($._type, '!', $._type)),
    )),

    dynamic_type: $ => seq('dyn', $.identifier),

    generic_type: $ => prec.dynamic(1, seq(
      choice($.identifier, $.scoped_type),
      $.type_arguments,
    )),

    scoped_type: $ => seq(
      $.identifier,
      repeat1(seq('::', $.identifier)),
    ),

    type_arguments: $ => seq(
      '<',
      $._type,
      repeat(seq(',', $._type)),
      optional(','),
      '>',
    ),

    // =========================================
    // Statements
    // =========================================

    _statement: $ => choice(
      $.let_statement,
      $.var_statement,
      $.return_statement,
      $.defer_statement,
      $.break_statement,
      $.continue_statement,
      $.assignment_statement,
      $.expression_statement,
      $.if_expression,
      $.match_expression,
      $.while_statement,
      $.for_statement,
      $.unsafe_block,
      $.comptime_if,
    ),

    let_statement: $ => seq(
      'let',
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
      optional(';'),
    ),

    var_statement: $ => seq(
      'var',
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
      optional(';'),
    ),

    return_statement: $ => prec.right(seq(
      'return',
      optional(field('value', $._expression)),
      optional(';'),
    )),

    defer_statement: $ => seq(
      'defer',
      field('value', $._expression),
      optional(';'),
    ),

    break_statement: $ => seq(
      'break',
      optional(seq(':', field('label', $.identifier))),
      optional(';'),
    ),

    continue_statement: $ => seq(
      'continue',
      optional(seq(':', field('label', $.identifier))),
      optional(';'),
    ),

    assignment_statement: $ => seq(
      field('target', $._expression),
      '=',
      field('value', $._expression),
      optional(';'),
    ),

    expression_statement: $ => seq(
      $._expression,
      optional(';'),
    ),

    while_statement: $ => seq(
      optional(field('label', $.label)),
      'while',
      field('condition', $._expression),
      field('body', $.block),
    ),

    for_statement: $ => seq(
      optional(field('label', $.label)),
      'for',
      field('range', $._expression),
      field('binding', $.closure_parameters),
      field('body', $.block),
    ),

    label: $ => seq($.identifier, ':'),

    closure_parameters: $ => seq(
      '|',
      $.identifier,
      repeat(seq(',', $.identifier)),
      '|',
    ),

    unsafe_block: $ => seq('unsafe', $.block),

    comptime_if: $ => prec.right(PREC.PREFIX + 1, seq(
      'comptime',
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.block, $.comptime_if)))),
    )),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    // =========================================
    // Expressions
    // =========================================

    _expression: $ => choice(
      $.identifier,
      $.integer_literal,
      $.string_literal,
      $.multiline_string_literal,
      $.boolean_literal,
      $.binary_expression,
      $.prefix_expression,
      $.borrow_expression,
      $.mutable_borrow_expression,
      $.try_expression,
      $.call_expression,
      $.type_application,
      $.index_expression,
      $.field_expression,
      $.namespace_expression,
      $.deref_expression,
      $.struct_literal,
      $.cast_expression,
      $.type_literal,
      $.error_expression,
      $.if_expression,
      $.match_expression,
      $.comptime_expression,
      $.range_expression,
      $.parenthesized_expression,
    ),

    binary_expression: $ => {
      const table = [
        [prec.left, PREC.OR, 'or'],
        [prec.left, PREC.AND, 'and'],
        [prec.left, PREC.EQUALITY, choice('==', '!=')],
        [prec.left, PREC.COMPARE, choice('<', '<=', '>', '>=')],
        [prec.left, PREC.SUM, choice('+', '-')],
        [prec.left, PREC.PRODUCT, choice('*', '/', '%')],
      ];
      return choice(...table.map(([fn, precedence, operator]) =>
        fn(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        )),
      ));
    },

    prefix_expression: $ => prec(PREC.PREFIX, seq(
      field('operator', choice('-', '!')),
      field('operand', $._expression),
    )),

    borrow_expression: $ => prec(PREC.PREFIX, seq(
      '&',
      field('value', $._expression),
    )),

    mutable_borrow_expression: $ => prec(PREC.PREFIX, seq(
      '&',
      'var',
      field('value', $._expression),
    )),

    try_expression: $ => prec(PREC.PREFIX, seq(
      'try',
      field('value', $._expression),
    )),

    call_expression: $ => prec(PREC.CALL, seq(
      field('function', $._expression),
      field('arguments', $.argument_list),
    )),

    type_application: $ => prec.dynamic(2, prec(PREC.CALL, seq(
      field('function', $._expression),
      field('type_arguments', $.type_arguments),
      field('arguments', $.argument_list),
    ))),

    argument_list: $ => seq(
      '(',
      optional(seq(
        $._expression,
        repeat(seq(',', $._expression)),
        optional(','),
      )),
      ')',
    ),

    index_expression: $ => prec(PREC.CALL, seq(
      field('value', $._expression),
      '[',
      field('index', $._index),
      ']',
    )),

    _index: $ => choice(
      $._expression,
      $.slice_range,
    ),

    slice_range: $ => prec.dynamic(1, choice(
      seq(field('start', $._expression), '..', field('end', $._expression)),
      seq(field('start', $._expression), '..'),
      seq('..', field('end', $._expression)),
    )),

    field_expression: $ => prec.left(PREC.FIELD, seq(
      field('value', $._expression),
      '.',
      field('field', $.identifier),
    )),

    namespace_expression: $ => prec.left(PREC.FIELD, seq(
      field('namespace', $._expression),
      '::',
      field('name', $.identifier),
    )),

    deref_expression: $ => prec.left(PREC.FIELD, seq(
      field('value', $._expression),
      token(seq('.', '*')),
    )),

    struct_literal: $ => prec.dynamic(-1, seq(
      field('type', choice($.identifier, $.generic_type, $.scoped_type)),
      '{',
      optional(seq(
        $.field_initializer,
        repeat(seq(',', $.field_initializer)),
        optional(','),
      )),
      '}',
    )),

    field_initializer: $ => seq(
      field('name', $.identifier),
      ':',
      field('value', $._expression),
    ),

    cast_expression: $ => seq(
      'cast',
      '<',
      field('type', $._type),
      '>',
      '(',
      field('value', $._expression),
      ')',
    ),

    type_literal: $ => seq(
      'type',
      '<',
      field('type', $._type),
      '>',
    ),

    error_expression: $ => seq(
      'error',
      '(',
      field('message', $._expression),
      ')',
    ),

    if_expression: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq('else', field('alternative', choice($.block, $.if_expression)))),
    )),

    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      '{',
      optional(seq(
        $.match_arm,
        repeat(seq(',', $.match_arm)),
        optional(','),
      )),
      '}',
    ),

    match_arm: $ => seq(
      field('pattern', $._pattern),
      '=>',
      field('value', choice($._expression, $.block)),
      optional(';'),
    ),

    _pattern: $ => choice(
      $.identifier,
      $.wildcard_pattern,
      $.constructor_pattern,
    ),

    wildcard_pattern: _ => '_',

    constructor_pattern: $ => seq(
      field('name', $.identifier),
      '(',
      field('binding', $.identifier),
      ')',
    ),

    comptime_expression: $ => prec.right(PREC.RANGE, seq(
      'comptime',
      field('value', $._expression),
    )),

    range_expression: $ => prec.left(PREC.RANGE, seq(
      field('start', $._expression),
      '..',
      field('end', $._expression),
    )),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // =========================================
    // Literals
    // =========================================

    integer_literal: _ => /[0-9][0-9_]*/,

    string_literal: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        /\\./,
      )),
      '"',
    )),

    multiline_string_literal: $ => prec.right(repeat1($.multiline_string_line)),

    multiline_string_line: _ => token(seq('\\\\', /.*/)),

    boolean_literal: _ => choice('true', 'false'),

    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
