import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                登録ありがとうございます！
              </CardTitle>
              <CardDescription>メールを確認してください</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                登録が完了しました。ログインする前に、メールを確認してアカウントを有効化してください。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
