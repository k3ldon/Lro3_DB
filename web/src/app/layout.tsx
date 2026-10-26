import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "ERODS-RO3 — Ragnarok Online 3 Database",
  description: "Base de datos oficial de Ragnarok Online 3: ítems, monstruos, MVPs, cartas y drops.",
};

const NAV: Array<{ label: string; links: Array<{ text: string; href: string }> }> = [
  {
    label: "Monsters",
    links: [
      { text: "Monster Search", href: "/monsters" },
      { text: "Boss Monsters (MvP)", href: "/mvps" },
      { text: "Full Monster list", href: "/monsters" },
    ],
  },
  {
    label: "Items",
    links: [
      { text: "Item Search", href: "/items" },
      { text: "Full Item Listing", href: "/items" },
    ],
  },
  {
    label: "Cards",
    links: [{ text: "Card Database", href: "/cards" }],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div id="main">
          <div className="topbar">
            <a href="/" className="loginLink">ERODS-RO3</a>
            <a href="/items">Ítems</a>
            <a href="/monsters">Monstruos</a>
            <a href="/mvps">MVPs</a>
            <a href="/cards">Cartas</a>
            <CommandPalette />
          </div>

          <table style={{ width: "100%" }} cellSpacing={0} cellPadding={0}>
            <tbody>
              <tr>
                <td style={{ width: 141, textAlign: "center" }}>
                  <a href="/">
                    <span style={{ fontFamily: "'Arial Narrow', Arial", fontSize: "22pt", fontWeight: "bold", color: "#000000", textDecoration: "none" }}>
                      ERODS<span style={{ color: "#ff6600" }}>-RO3</span>
                    </span>
                  </a>
                </td>
                <td>
                  <div className="smoothHeader" style={{ padding: "8px 0" }}>
                    Ragnarok Online 3 Database
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ float: "left" }}>
            {NAV.map((group) => (
              <div key={group.label}>
                <div className="simoni">
                  <b>{group.label}</b>
                </div>
                {group.links.map((l) => (
                  <div className="simoni" key={l.text}>
                    <a href={l.href}>{l.text}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ clear: "both", width: "100%", height: 11 }} />
        </div>

        <div id="necky_nuts">
          <div className="inpadding">{children}</div>
        </div>

        <div style={{ background: "transparent", margin: "0 auto", width: "75%", padding: "20px 0" }}>
          <div className="exlinespd" />
          <br />
          <div id="finalEnding">
            <center>
              <table cellPadding={5}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "left" }}>
                      <a href="/items">Ítems</a> | <a href="/monsters">Monstruos</a> |{" "}
                      <a href="/mvps">MVPs</a> | <a href="/cards">Cartas</a>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: "left", color: "#666666" }}>
                      ERODS copyright &copy; OutOfCuriosity.<br />
                      Ragnarok Online copyright &copy; Gravity Corp.<br />
                      Ragnarok Online 3 data &middot; db.lagnarok.online
                    </td>
                  </tr>
                </tbody>
              </table>
            </center>
          </div>
        </div>
      </body>
    </html>
  );
}
