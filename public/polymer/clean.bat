
del /s /q *.json *.md *.ts
FOR /d /r . %%d IN (demo) DO @IF EXIST "%%d" rd /s /q "%%d"
FOR /d /r . %%d IN (test) DO @IF EXIST "%%d" rd /s /q "%%d"