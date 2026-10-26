import { getDb } from "@/db";

export const dynamic = "force-dynamic";

function sample(db: ReturnType<typeof getDb>, sql: string) {
  return db.prepare(sql).all() as Array<Record<string, unknown>>;
}

export default function Home() {
  const db = getDb();
  const count = (t: string) => (db.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as { c: number }).c;

  const topItems = sample(
    db,
    `SELECT id, name, quality, icon FROM items WHERE icon != '' AND quality >= 5 ORDER BY quality DESC, id LIMIT 6`
  );
  const topMonsters = sample(
    db,
    `SELECT id, name, level, is_mvp AS isMvp, icon FROM monsters WHERE icon != '' ORDER BY is_mvp DESC, hp DESC LIMIT 4`
  );

  const stats = [
    { label: "Ítems", value: count("items"), href: "/items" },
    { label: "Monstruos", value: count("monsters"), href: "/monsters" },
    { label: "MVPs", value: count("mvps"), href: "/mvps" },
    { label: "Cartas", value: count("cards"), href: "/cards" },
  ];

  return (
    <div style={{ paddingRight: 20 }}>
      <div>
        <div className="smoothHeader" style={{ marginBottom: 12 }}>
          Bienvenido a <span className="ffruit">ERODS-RO3</span>
        </div>

        <div style={{ width: 700 }}>
          La base de datos de Ragnarok Online 3: ítems, monstruos, MVPs y cartas extraídos
          directamente de los datos del emulador, con iconos originales del cliente y tablas
          de drop completas.
        </div>

        <br />

        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
              {stats.map((s) => (
                <td key={s.label} style={{ textAlign: "center", padding: "10px" }}>
                  <a href={s.href} style={{ textDecoration: "none" }}>
                    <span style={{ fontSize: "20pt", fontWeight: "bold" }}>{s.value.toLocaleString("es")}</span>
                    <br />
                    <span className="grayclr">{s.label}</span>
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="exlinesp" style={{ margin: "20px 0" }} />

      {/* Media links — port of layout/default.php */}
      <table style={{ marginLeft: 125 }}>
        <tbody>
          <tr>
            <td>
              <table>
                <tbody>
                  <tr>
                    <td rowSpan={2} style={{ paddingRight: 10, textAlign: "center" }}>
                      <div className="icon-frame" style={{ width: 100, height: 100 }}>
                        {topMonsters[0]?.icon ? (
                          <img src={String(topMonsters[0].icon)} alt="Monster" width={96} height={96} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="ffruit">Búsqueda de Monstruos</span>
                      <br />
                      <br />
                      <span className="grayclr">
                        Consulta stats, elementos y drops de todos los monstruos de RO3.
                      </span>
                      <br />
                      <br />
                      <a href="/monsters" className="random">
                        <span className="ffruit">→ Ir</span>
                      </a>
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td>
              <table>
                <tbody>
                  <tr>
                    <td rowSpan={2} style={{ paddingRight: 20, textAlign: "center" }}>
                      <div className="icon-frame" style={{ width: 100, height: 100 }}>
                        {topItems[0]?.icon ? (
                          <img src={String(topItems[0].icon)} alt="Item" width={96} height={96} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="ffruit">Búsqueda de Ítems</span>
                      <br />
                      <br />
                      <span className="grayclr">
                        Equipo, consumibles y materiales con calidad, afijos y origen.
                      </span>
                      <br />
                      <br />
                      <a href="/items" className="random">
                        <span className="ffruit">→ Ir</span>
                      </a>
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <table>
                <tbody>
                  <tr>
                    <td rowSpan={2} style={{ paddingRight: 10, textAlign: "center" }}>
                      <div className="icon-frame" style={{ width: 100, height: 100 }}>
                        {topMonsters[1]?.icon ? (
                          <img src={String(topMonsters[1].icon)} alt="MVP" width={96} height={96} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="ffruit">Boss Monsters (MvP)</span>
                      <br />
                      <br />
                      <span className="grayclr">
                        Jefes mundiales con tiempo de reaparición y recompensas raras.
                      </span>
                      <br />
                      <br />
                      <a href="/mvps" className="random">
                        <span className="ffruit">→ Ir</span>
                      </a>
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            <td>
              <table>
                <tbody>
                  <tr>
                    <td rowSpan={2} style={{ paddingRight: 20, textAlign: "center" }}>
                      <div className="icon-frame" style={{ width: 100, height: 100 }}>
                        {topItems[1]?.icon ? (
                          <img src={String(topItems[1].icon)} alt="Card" width={96} height={96} />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="ffruit">Cartas</span>
                      <br />
                      <br />
                      <span className="grayclr">
                        Niveles, tiers, power score y atributos de todas las cartas.
                      </span>
                      <br />
                      <br />
                      <a href="/cards" className="random">
                        <span className="ffruit">→ Ir</span>
                      </a>
                      <br />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
