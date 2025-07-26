@echo off
echo シフト希望表集計サイトのセットアップを開始します...
echo.

echo Node.jsがインストールされているか確認中...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: Node.jsがインストールされていません。
    echo https://nodejs.org/ からNode.jsをダウンロードしてインストールしてください。
    pause
    exit /b 1
)

echo Node.jsが見つかりました。
echo.

echo 依存関係をインストール中...
npm install

if %errorlevel% neq 0 (
    echo エラー: インストールに失敗しました。
    pause
    exit /b 1
)

echo.
echo セットアップが完了しました！
echo.
echo サーバーを起動するには以下のコマンドを実行してください:
echo npm run dev
echo.
echo その後、ブラウザで http://localhost:3000 にアクセスしてください。
echo.
pause
