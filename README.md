# tree-sitter-kizu

[kizu](https://github.com/kizu-lang/kizu) programming language grammar for [tree-sitter](https://tree-sitter.github.io/).

## Features

- Full syntax support for kizu lang
- Syntax highlighting queries (`highlights.scm`)
- Local variable tracking queries (`locals.scm`)
- 71 test cases covering literals, declarations, statements, and expressions

## Neovim

### Install parser

Add to your nvim-treesitter config (main branch API):

```lua
vim.api.nvim_create_autocmd("User", {
  pattern = "TSUpdate",
  callback = function()
    require("nvim-treesitter.parsers").kizu = {
      install_info = {
        url = "https://github.com/kizu-lang/tree-sitter-kizu",
      },
      tier = 3,
    }
  end,
})
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
