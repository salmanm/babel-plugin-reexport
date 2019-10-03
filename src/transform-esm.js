export default function transformESM (program, state, { exportPath }, t) {
  const nodes = program.get('body')
  const hasExportDefault = nodes.some(n => n.isExportDefaultDeclaration())
  const hasExportNamed = nodes.some(n => n.isExportNamedDeclaration())
  const hasExportAll = nodes.some(n => n.isExportAllDeclaration())
  const namedDefaultNode = hasExportNamed && nodes.find(n => {
    if (!n.isExportNamedDeclaration() || !n.has('specifiers')) return false

    const specifiers = n.get('specifiers')
    const { exported } = specifiers[0].node
    return exported.name === 'default'
  })

  const exportNodes = []

  if (hasExportDefault) {
    exportNodes.push(
      getExportNamed(exportPath, ['default'], t)
    )
  }

  if (namedDefaultNode) {
    exportNodes.push(
      getExportNamed(exportPath, namedDefaultNode.get('specifiers').map(s => s.node.exported.name), t)
    )
  }

  if (hasExportAll || (hasExportNamed && !namedDefaultNode)) {
    exportNodes.push(
      getExportAll(exportPath, t)
    )
  }

  nodes.forEach(n => n.remove())
  exportNodes.forEach(n => program.pushContainer('body', n))
}

/** Generates line like `export { a, b } from 'pkg-dir/file'` */
function getExportNamed (exportPath, identifiers, t) {
  const specifiers = identifiers.map(name => t.exportSpecifier(t.identifier(name), t.identifier(name)))

  return t.exportNamedDeclaration(null, specifiers, t.stringLiteral(exportPath))
}

/** Generates line like `export * from 'pkg-dir/file'` */
function getExportAll (exportPath, t) {
  return t.exportAllDeclaration(t.stringLiteral(exportPath))
}
