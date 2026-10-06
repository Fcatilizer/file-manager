import test from 'node:test'
import assert from 'node:assert/strict'
import { getFileTypeInfo } from '../src/lib/fileIcons.ts'
import { ICON_PATHS } from '../src/lib/iconPaths.ts'

test('fileIcons correctly resolves archive formats', () => {
  const archives = [
    { name: 'backup.zip', label: 'ZIP Archive' },
    { name: 'archive.rar', label: 'RAR Archive' },
    { name: 'files.tar', label: 'TAR Archive' },
    { name: 'data.gz', label: 'GZIP Archive' },
    { name: 'data.tgz', label: 'TAR GZip Archive' },
    { name: 'dist.7z', label: '7-Zip Archive' },
    { name: 'pack.bz2', label: 'BZIP2 Archive' },
    { name: 'pack.tbz2', label: 'TAR BZip2 Archive' },
    { name: 'bundle.xz', label: 'XZ Archive' },
    { name: 'bundle.txz', label: 'TAR XZ Archive' },
    { name: 'image.tar.gz', label: 'TAR GZip Archive' },
    { name: 'image.tar.bz2', label: 'TAR BZip2 Archive' },
    { name: 'image.tar.xz', label: 'TAR XZ Archive' },
  ]

  for (const item of archives) {
    const info = getFileTypeInfo(item.name, false)
    assert.equal(info.category, 'archive', `${item.name} should have category archive`)
    assert.equal(info.iconName, 'fileArchive', `${item.name} should use fileArchive icon`)
    assert.equal(info.label, item.label, `${item.name} label matches`)
    assert.ok(ICON_PATHS[info.iconName]?.length > 0, `${info.iconName} exists in ICON_PATHS`)
  }
})

test('fileIcons correctly resolves ISO disc images', () => {
  const info = getFileTypeInfo('ubuntu-24.04.iso', false)
  assert.equal(info.category, 'package')
  assert.equal(info.iconName, 'fileIso')
  assert.equal(info.label, 'ISO Disc Image')
  assert.ok(ICON_PATHS.fileIso?.length > 0)
  assert.ok(ICON_PATHS.disc?.length > 0)
})

test('fileIcons correctly resolves app packages and installers (apk, aab, ipa, exe, dmg, AppImage, deb, rpm)', () => {
  const apps = [
    { name: 'app-release.apk', icon: 'fileApk', label: 'Android Package' },
    { name: 'bundle.aab', icon: 'fileApk', label: 'Android App Bundle' },
    { name: 'Payload.ipa', icon: 'fileIpa', label: 'iOS App Package' },
    { name: 'setup.exe', icon: 'fileExe', label: 'Windows Executable' },
    { name: 'installer.msi', icon: 'fileExe', label: 'Windows Installer' },
    { name: 'Install.dmg', icon: 'fileDmg', label: 'Apple Disk Image' },
    { name: 'package.pkg', icon: 'fileDmg', label: 'macOS Package' },
    { name: 'Krita-5.2.0.AppImage', icon: 'fileAppImage', label: 'AppImage Application' },
    { name: 'krita.appimage', icon: 'fileAppImage', label: 'AppImage Application' },
    { name: 'package_amd64.deb', icon: 'fileDeb', label: 'Debian Package' },
    { name: 'fedora-package.rpm', icon: 'fileRpm', label: 'RPM Package' },
  ]

  for (const item of apps) {
    const info = getFileTypeInfo(item.name, false)
    assert.equal(info.category, 'package', `${item.name} should be category package`)
    assert.equal(info.iconName, item.icon, `${item.name} should use ${item.icon}`)
    assert.equal(info.label, item.label, `${item.name} label should match`)
    assert.ok(ICON_PATHS[info.iconName]?.length > 0, `${info.iconName} should exist in ICON_PATHS`)
  }
})

test('navigation icons resolve folder vs specific file types accurately', () => {
  // Folders always resolve to folder icon
  const folderInfo = getFileTypeInfo('Documents', true)
  assert.equal(folderInfo.iconName, 'folder')
  assert.equal(folderInfo.category, 'folder')

  // Shared file packages resolve to their exact file icon, not folder
  const ipaInfo = getFileTypeInfo('Edu Nova.ipa', false)
  assert.equal(ipaInfo.iconName, 'fileIpa')
  assert.equal(ipaInfo.label, 'iOS App Package')

  const zipInfo = getFileTypeInfo('Photos.zip', false)
  assert.equal(zipInfo.iconName, 'fileArchive')

  const pdfInfo = getFileTypeInfo('Resume.pdf', false)
  assert.equal(pdfInfo.iconName, 'filePdf')
})
