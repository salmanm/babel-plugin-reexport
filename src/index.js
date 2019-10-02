import Path from 'path';

export default function({ types: t }) {
  return {
    visitor: {
      Program: {
        exit(path, state) {
          fn(path, state, t)
        }
      }
    },
  };
}

const defaultOpts = {
  moduleDir: '/node_modules/'
}

function fn (path, state, t) {
  const program = path.scope.getProgramParent().path;

  const nodes = program.get('body');
  const hasExportDefault = nodes.some(n => n.isExportDefaultDeclaration());
  const hasExportNamed = nodes.some(n => n.isExportNamedDeclaration());
  const hasExportAll = nodes.some(n => n.isExportAllDeclaration());
  const namedDefaultNode = hasExportNamed && nodes.find(n => {
    if (!n.isExportNamedDeclaration() || !n.has('specifiers')) return false;

    const specifiers = n.get('specifiers');
    const { exported } = specifiers[0].node;
    return exported.name === 'default';
  });

  const { moduleDir } = { ...defaultOpts, ...state.opts };
  const filePath = state.filename;
  const pkgDir = Path.dirname(filePath.substr(filePath.indexOf(moduleDir) + moduleDir.length));
  const fileName = Path.basename(filePath, Path.extname(filePath));
  const exportPath = Path.join(pkgDir, fileName);

  const exportNodes = [];

  if (hasExportDefault) {
    exportNodes.push(
      getExportNamed(exportPath, ['default'], t)
    );
  }

  if (namedDefaultNode) {
    exportNodes.push(
      getExportNamed(exportPath, namedDefaultNode.get('specifiers').map(s => s.node.exported.name), t)
    );
  }

  if (hasExportAll || (hasExportNamed && !namedDefaultNode)) {
    exportNodes.push(
      getExportAll(exportPath, t)
    );
  }

  nodes.forEach(n => n.remove());
  exportNodes.forEach(n => program.pushContainer('body', n));
}

/** Generates line like `export { a, b } from 'pkg-dir/file'` */
function getExportNamed(exportPath, identifiers, t) {
  const specifiers = identifiers.map(name => t.exportSpecifier(t.identifier(name), t.identifier(name)))

  return t.exportNamedDeclaration(null, specifiers, t.stringLiteral(exportPath));
}

/** Generates line like `export * from 'pkg-dir/file'` */
function getExportAll(exportPath, t) {
  return t.exportAllDeclaration(t.stringLiteral(exportPath));
}
