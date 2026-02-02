"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type SiteRow = { id: string; url: string; created_at: string };

export default function SettingsSites() {
  const [url, setUrl] = useState("");
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sites")
      .select("id,url,created_at")
      .order("created_at", { ascending: false });
    setSites((data ?? []) as SiteRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const v = url.trim();
    if (!v) return;

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return alert("ログインしてください");

    const { error } = await supabase.from("sites").insert([{ user_id: userId, url: v }]);
    if (error) return alert(error.message);

    setUrl("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <h2 style={{ fontSize: 16, marginBottom: 8 }}>サイト登録</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button onClick={add} style={{ padding: "10px 12px", borderRadius: 10 }}>
          追加
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : sites.length === 0 ? (
          <p style={{ color: "#777" }}>まだありません</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sites.map((s) => (
              <li key={s.id} style={{ marginBottom: 8 }}>
                {s.url}{" "}
                <button onClick={() => remove(s.id)} style={{ marginLeft: 8 }}>
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
