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
        name: 'typescript-basics',
        version: '1.60.0'
      }
    ].concat(
      [
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
        'markdown-basics',
        'objective-c',
        'perl',
        'php',
        'powershell',
        'pug',
        'python',
        'razor',
        'ruby',
        'rust',
        'scss',
        'shaderlab',
        'shellscript',
        'sql',
        'swift',
        'vb',
        'xml',
        'yaml'
      ].map(name => ({
        name,
        version: '1.55.2'
      }))
    )
  }
}
