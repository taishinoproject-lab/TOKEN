// 「要確認」の札（案A：朱の枠）。情報が未確認（confidence: "unverified"）のものに付ける。
interface Props {
  /** 札の意味を補う説明（ツールチップと読み上げ用） */
  title?: string;
}

export default function UnverifiedBadge({ title = "公式の情報源での確認がまだ済んでいません" }: Props) {
  return (
    <span className="kakunin" title={title}>
      要確認
    </span>
  );
}
