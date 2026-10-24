; Remodel Studio installer (per-user, no admin rights needed)
Unicode true
SetCompressor /SOLID lzma
SetCompressorDictSize 64
!include "MUI2.nsh"
!include "FileFunc.nsh"
!define APP "Remodel Studio"
!define VER "1.8.0"
!define EXE "Remodel Studio.exe"
!define UNKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\RemodelStudio"
Name "${APP}"
OutFile "dist\Remodel Studio Setup ${VER}.exe"
InstallDir "$LOCALAPPDATA\Programs\Remodel Studio"
InstallDirRegKey HKCU "Software\RemodelStudio" "InstallDir"
RequestExecutionLevel user
BrandingText "Remodel Studio ${VER}"
VIProductVersion "${VER}.0"
VIAddVersionKey "ProductName" "${APP}"
VIAddVersionKey "FileDescription" "${APP} installer"
VIAddVersionKey "FileVersion" "${VER}"
VIAddVersionKey "LegalCopyright" "Personal use"
!define MUI_ICON "build\icon.ico"
!define MUI_UNICON "build\icon.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Install Remodel Studio"
!define MUI_WELCOMEPAGE_TEXT "Remodel Studio is your home design and remodel program: floor plans, 3D, code checks, estimates, plan sets and Blender renders.$\r$\n$\r$\nIt installs just for you (no administrator password) and works without internet."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXE}"
!define MUI_FINISHPAGE_RUN_TEXT "Open Remodel Studio now"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  ; close a running copy so files can be replaced
  nsExec::Exec 'taskkill /IM "${EXE}" /F'
  SetOutPath "$INSTDIR"
  File /r "dist\win-unpacked\*.*"
  WriteUninstaller "$INSTDIR\Uninstall Remodel Studio.exe"
  CreateShortCut "$SMPROGRAMS\${APP}.lnk" "$INSTDIR\${EXE}" "" "$INSTDIR\${EXE}" 0
  CreateShortCut "$DESKTOP\${APP}.lnk" "$INSTDIR\${EXE}" "" "$INSTDIR\${EXE}" 0
  ; .rsp project files open in Remodel Studio
  WriteRegStr HKCU "Software\Classes\.rsp" "" "RemodelStudio.Project"
  WriteRegStr HKCU "Software\Classes\RemodelStudio.Project" "" "Remodel Studio project"
  WriteRegStr HKCU "Software\Classes\RemodelStudio.Project\DefaultIcon" "" "$INSTDIR\resources\file.ico"
  WriteRegStr HKCU "Software\Classes\RemodelStudio.Project\shell\open\command" "" '"$INSTDIR\${EXE}" "%1"'
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
  ; Add/Remove Programs entry
  WriteRegStr HKCU "Software\RemodelStudio" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "DisplayName" "${APP}"
  WriteRegStr HKCU "${UNKEY}" "DisplayVersion" "${VER}"
  WriteRegStr HKCU "${UNKEY}" "Publisher" "Adam"
  WriteRegStr HKCU "${UNKEY}" "DisplayIcon" "$INSTDIR\${EXE}"
  WriteRegStr HKCU "${UNKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "UninstallString" '"$INSTDIR\Uninstall Remodel Studio.exe"'
  WriteRegDWORD HKCU "${UNKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNKEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  WriteRegDWORD HKCU "${UNKEY}" "EstimatedSize" $0
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /IM "${EXE}" /F'
  Delete "$SMPROGRAMS\${APP}.lnk"
  Delete "$DESKTOP\${APP}.lnk"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "Software\Classes\RemodelStudio.Project"
  ReadRegStr $0 HKCU "Software\Classes\.rsp" ""
  StrCmp $0 "RemodelStudio.Project" 0 +2
    DeleteRegKey HKCU "Software\Classes\.rsp"
  DeleteRegKey HKCU "${UNKEY}"
  DeleteRegKey HKCU "Software\RemodelStudio"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
  ; your projects and renders in Documents\Remodel Studio are kept
SectionEnd
