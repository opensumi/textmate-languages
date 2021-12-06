const VSCODE_BUILTIN_EXTENSIONS = [
  'bat',
  'clojure',
  'coffeescript',
  'cpp',
  'csharp',
  'css',
  'docker',
  'fsharp',
  'go',
  'groovy',
  'handlebars',
  'hlsl',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'less',
  'log',
  'lua',
  'make',
  'markdown',
  'objective-c',
  'perl',
  'php',
  'powershell',
  'pug',
  'python',
  'r',
  'razor',
  'ruby',
  'rust',
  'scss',
  'shaderlab',
  'shellscript',
  'sql',
  'swift',
  'typescript',
  'vb',
  'xml',
  'yaml'
]

module.exports = {
  extensions: {
    vscode: [
      {
        name: 'vue',
        version: '0.1.5'
      },
      {
        name: 'acss',
        version: '0.0.2'
      },
      {
        name: 'schema',
        version: '0.0.1'
      },
      {
        name: 'velocity',
        version: '0.7.1'
      },
      {
        name: 'vscode-proto3',
        version: '0.3.0'
      },
      {
        name: 'Kotlin',
        version: '1.7.1'
      },
      {
        name: 'solidity',
        version: '0.0.125'
      }
    ].concat(
      VSCODE_BUILTIN_EXTENSIONS.map(name => ({
        name
      }))
    )
  }
}
