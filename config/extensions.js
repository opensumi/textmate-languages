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
    fwcd: [
      {
        name: 'Kotlin',
        version: '0.2.26'
      }
    ],
    znck: [
      {
        name: 'vue',
        version: '0.11.4'
      }
    ],
    sodatea: [
      {
        name: 'velocity',
        version: '0.2.0'
      }
    ],
    zxh404: [
      {
        name: 'vscode-proto3',
        version: '0.5.5'
      }
    ],
    contractshark: [
      {
        name: 'solidity-lang',
        version: '1.3.0'
      }
    ],
    jeandeaual: [
      {
        name: 'scheme',
        version: '0.2.0'
      }
    ],
    kcl: [
      {
        name: 'kcl-vscode-extension',
        version: '0.2.1'
      }
    ],
    'dan-c-underwood': [
      {
        name: 'arm',
        version: '1.4.0'
      }
    ],
    ZixuanWang: [
      {
        name: 'linkerscript',
        version: '1.0.4'
      }
    ],
    vscode: [].concat(
      VSCODE_BUILTIN_EXTENSIONS.map(name => ({
        name
      }))
    )
  }
}
