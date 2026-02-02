"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type KeywordRow = { id: string; keyword: string; created_at: string };

export default function SettingsKeywords() {
  const [kw, setKw] = useState("");
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("keywords")
      .select("id,keyword,created_at")
      .order("created_at", { ascending: false });
    setKeywords((data ?? []) as KeywordRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const v = kw.trim();
    if (!v) return;

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return alert("ログインしてください");

    const { error } = await supabase.from("keywords").insert([{ user_id: userId, keyword: v }]);
    if (error) return alert(error.message);

    setKw("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("keywords").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <h2 style={{ fontSize: 16, marginBottom: 8 }}>キーワード登録</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="例: AI, 採用, 生成AI..."
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button onClick={add} style={{ padding: "10px 12px", borderRadius: 10 }}>
          追加
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : keywords.length === 0 ? (
          <p style={{ color: "#777" }}>まだありません</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {keywords.map((k) => (
              <li key={k.id} style={{ marginBottom: 8 }}>
                {k.keyword}{" "}
                <button onClick={() => remove(k.id)} style={{ marginLeft: 8 }}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
