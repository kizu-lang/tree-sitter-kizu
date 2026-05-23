# tree-sitter-kizu

[kizu](https://github.com/kizu-lang/kizu) programming language grammar for [tree-sitter](https://tree-sitter.github.io/).

## Features

- Full syntax support for kizu lang
- Syntax highlighting queries (`highlights.scm`)
- Local variable tracking queries (`locals.scm`)
- 62 test cases covering literals, declarations, statements, and expressions

## Neovim

### Install parser

Add to your nvim-treesitter config:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.kizu = {
  install_info = {
    url = "https://github.com/kizu-lang/tree-sitter-kizu",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "kizu",
}
```

Register the filetype in your `init.lua`:

```lua
vim.filetype.add({
  extension = {
    kizu = "kizu",
  },
})
```

Then run `:TSInstall kizu` in Neovim.

### Queries

Copy `queries/` to `~/.config/nvim/queries/kizu/` or they will be picked up automatically from the plugin.

## Development

```sh
npm install
npx tree-sitter generate
npx tree-sitter test
```

## License

MIT
