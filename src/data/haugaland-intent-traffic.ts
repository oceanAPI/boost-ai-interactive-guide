import type { IntentTrafficSummary } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
 *  Haugaland Kraft — real intent-traffic rollup
 *
 *  Parsed from the boost.ai intent-traffic export
 *  (Oct 2025 – Mar 2026) with parseIntentTrafficCsv, then frozen
 *  as a static summary. Stands in for the AWS metadata fetch so the
 *  placeholder Haugaland customer renders the Intent Traffic section
 *  with real conversation analytics. Counts only — every percentage
 *  is derived at render.
 * ────────────────────────────────────────────────────────────── */

export const HAUGALAND_INTENT_TRAFFIC: IntentTrafficSummary = {
  "period": "01.10.2025-31.03.2026",
  "source": "Haugaland Kraft — intent_traffic export",
  "intentCount": 2310,
  "totals": {
    "traffic": 26925,
    "reviewed": 7583,
    "automated": 2287,
    "escalated": 3393,
    "unsolved": 1903,
    "handover": 8018,
    "noPrediction": 17992,
    "positiveFeedback": 1713,
    "negativeFeedback": 1845,
    "immediateUnknown": 833
  },
  "roots": [
    {
      "root": "Altibox",
      "traffic": 8475,
      "reviewed": 2238,
      "automated": 669,
      "escalated": 831,
      "unsolved": 738,
      "handover": 2358,
      "noPrediction": 5965,
      "topIntents": [
        {
          "intent": "Feil på internett",
          "traffic": 1287,
          "reviewed": 372,
          "automated": 85,
          "escalated": 126,
          "unsolved": 161,
          "handover": 284,
          "noPrediction": 1135
        },
        {
          "intent": "TV-innhold",
          "traffic": 696,
          "reviewed": 163,
          "automated": 74,
          "escalated": 43,
          "unsolved": 46,
          "handover": 140,
          "noPrediction": 666
        },
        {
          "intent": "Altibox",
          "traffic": 267,
          "reviewed": 68,
          "automated": 17,
          "escalated": 31,
          "unsolved": 20,
          "handover": 98,
          "noPrediction": 80
        },
        {
          "intent": "Feilmelding",
          "traffic": 245,
          "reviewed": 39,
          "automated": 15,
          "escalated": 15,
          "unsolved": 9,
          "handover": 37,
          "noPrediction": 221
        },
        {
          "intent": "Tilbud Altibox",
          "traffic": 182,
          "reviewed": 45,
          "automated": 1,
          "escalated": 33,
          "unsolved": 11,
          "handover": 117,
          "noPrediction": 162
        },
        {
          "intent": "TV",
          "traffic": 169,
          "reviewed": 42,
          "automated": 19,
          "escalated": 9,
          "unsolved": 14,
          "handover": 31,
          "noPrediction": 126
        }
      ]
    },
    {
      "root": "Bedriften vår",
      "traffic": 3720,
      "reviewed": 1092,
      "automated": 262,
      "escalated": 767,
      "unsolved": 63,
      "handover": 1709,
      "noPrediction": 2510,
      "topIntents": [
        {
          "intent": "Snakke med menneske",
          "traffic": 1813,
          "reviewed": 522,
          "automated": 45,
          "escalated": 469,
          "unsolved": 8,
          "handover": 1196,
          "noPrediction": 1229
        },
        {
          "intent": "Kundeservice",
          "traffic": 512,
          "reviewed": 179,
          "automated": 24,
          "escalated": 150,
          "unsolved": 5,
          "handover": 341,
          "noPrediction": 309
        },
        {
          "intent": "Telefon",
          "traffic": 221,
          "reviewed": 61,
          "automated": 36,
          "escalated": 24,
          "unsolved": 1,
          "handover": 9,
          "noPrediction": 179
        },
        {
          "intent": "E-postadressen til kundeservice",
          "traffic": 183,
          "reviewed": 56,
          "automated": 40,
          "escalated": 14,
          "unsolved": 2,
          "handover": 5,
          "noPrediction": 152
        },
        {
          "intent": "E-post til kundesenteret",
          "traffic": 92,
          "reviewed": 25,
          "automated": 19,
          "escalated": 6,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 71
        },
        {
          "intent": "Ring meg",
          "traffic": 61,
          "reviewed": 15,
          "automated": 5,
          "escalated": 8,
          "unsolved": 2,
          "handover": 3,
          "noPrediction": 44
        }
      ]
    },
    {
      "root": "Kundeforhold",
      "traffic": 3597,
      "reviewed": 997,
      "automated": 295,
      "escalated": 486,
      "unsolved": 216,
      "handover": 1252,
      "noPrediction": 2260,
      "topIntents": [
        {
          "intent": "Oppsigelse Altibox",
          "traffic": 314,
          "reviewed": 82,
          "automated": 18,
          "escalated": 55,
          "unsolved": 9,
          "handover": 173,
          "noPrediction": 254
        },
        {
          "intent": "Oppsigelse",
          "traffic": 249,
          "reviewed": 77,
          "automated": 6,
          "escalated": 57,
          "unsolved": 14,
          "handover": 134,
          "noPrediction": 207
        },
        {
          "intent": "Oppsigelse Internett",
          "traffic": 102,
          "reviewed": 30,
          "automated": 10,
          "escalated": 12,
          "unsolved": 8,
          "handover": 47,
          "noPrediction": 77
        },
        {
          "intent": "Flytte",
          "traffic": 75,
          "reviewed": 31,
          "automated": 18,
          "escalated": 7,
          "unsolved": 6,
          "handover": 14,
          "noPrediction": 39
        },
        {
          "intent": "Bestille Internett",
          "traffic": 64,
          "reviewed": 20,
          "automated": 12,
          "escalated": 7,
          "unsolved": 1,
          "handover": 17,
          "noPrediction": 34
        },
        {
          "intent": "Bedre pris",
          "traffic": 60,
          "reviewed": 11,
          "automated": 2,
          "escalated": 7,
          "unsolved": 2,
          "handover": 40,
          "noPrediction": 52
        }
      ]
    },
    {
      "root": "Generelle spørsmål",
      "traffic": 2452,
      "reviewed": 672,
      "automated": 139,
      "escalated": 364,
      "unsolved": 169,
      "handover": 737,
      "noPrediction": 1039,
      "topIntents": [
        {
          "intent": "Hei",
          "traffic": 413,
          "reviewed": 115,
          "automated": 28,
          "escalated": 67,
          "unsolved": 20,
          "handover": 188,
          "noPrediction": 51
        },
        {
          "intent": "Takk",
          "traffic": 195,
          "reviewed": 52,
          "automated": 20,
          "escalated": 28,
          "unsolved": 4,
          "handover": 9,
          "noPrediction": 161
        },
        {
          "intent": "Nei",
          "traffic": 114,
          "reviewed": 32,
          "automated": 4,
          "escalated": 17,
          "unsolved": 11,
          "handover": 27,
          "noPrediction": 50
        },
        {
          "intent": "Ja",
          "traffic": 86,
          "reviewed": 23,
          "automated": 6,
          "escalated": 12,
          "unsolved": 5,
          "handover": 33,
          "noPrediction": 26
        },
        {
          "intent": "Det virker ikke",
          "traffic": 60,
          "reviewed": 24,
          "automated": 4,
          "escalated": 10,
          "unsolved": 10,
          "handover": 18,
          "noPrediction": 27
        },
        {
          "intent": "Snakker du engelsk?",
          "traffic": 57,
          "reviewed": 19,
          "automated": 7,
          "escalated": 7,
          "unsolved": 5,
          "handover": 15,
          "noPrediction": 16
        }
      ]
    },
    {
      "root": "Faktura",
      "traffic": 2310,
      "reviewed": 697,
      "automated": 243,
      "escalated": 312,
      "unsolved": 142,
      "handover": 711,
      "noPrediction": 1684,
      "topIntents": [
        {
          "intent": "Faktura",
          "traffic": 804,
          "reviewed": 210,
          "automated": 73,
          "escalated": 96,
          "unsolved": 41,
          "handover": 263,
          "noPrediction": 700
        },
        {
          "intent": "Fakturadato",
          "traffic": 82,
          "reviewed": 24,
          "automated": 16,
          "escalated": 5,
          "unsolved": 3,
          "handover": 15,
          "noPrediction": 76
        },
        {
          "intent": "Utsette faktura",
          "traffic": 76,
          "reviewed": 33,
          "automated": 13,
          "escalated": 15,
          "unsolved": 5,
          "handover": 33,
          "noPrediction": 68
        },
        {
          "intent": "Fakturakopi",
          "traffic": 54,
          "reviewed": 19,
          "automated": 7,
          "escalated": 12,
          "unsolved": 0,
          "handover": 22,
          "noPrediction": 21
        },
        {
          "intent": "Feil på faktura",
          "traffic": 50,
          "reviewed": 16,
          "automated": 1,
          "escalated": 11,
          "unsolved": 4,
          "handover": 32,
          "noPrediction": 44
        },
        {
          "intent": "Finne faktura",
          "traffic": 48,
          "reviewed": 15,
          "automated": 10,
          "escalated": 3,
          "unsolved": 2,
          "handover": 6,
          "noPrediction": 36
        }
      ]
    },
    {
      "root": "Unknown",
      "traffic": 1699,
      "reviewed": 493,
      "automated": 75,
      "escalated": 211,
      "unsolved": 207,
      "handover": 446,
      "noPrediction": 1376,
      "topIntents": [
        {
          "intent": "Unknown",
          "traffic": 1699,
          "reviewed": 493,
          "automated": 75,
          "escalated": 211,
          "unsolved": 207,
          "handover": 446,
          "noPrediction": 1376
        }
      ]
    },
    {
      "root": "Min side / Mine sider",
      "traffic": 1376,
      "reviewed": 411,
      "automated": 118,
      "escalated": 189,
      "unsolved": 104,
      "handover": 451,
      "noPrediction": 865,
      "topIntents": [
        {
          "intent": "Problem med innlogging Mine sider - Altibox",
          "traffic": 156,
          "reviewed": 50,
          "automated": 7,
          "escalated": 31,
          "unsolved": 12,
          "handover": 80,
          "noPrediction": 113
        },
        {
          "intent": "Problem med innlogging Min Side/Mine Sider",
          "traffic": 129,
          "reviewed": 36,
          "automated": 5,
          "escalated": 21,
          "unsolved": 10,
          "handover": 58,
          "noPrediction": 104
        },
        {
          "intent": "Internettpassord",
          "traffic": 93,
          "reviewed": 24,
          "automated": 17,
          "escalated": 3,
          "unsolved": 4,
          "handover": 5,
          "noPrediction": 55
        },
        {
          "intent": "Logge inn Min Side/Mine Sider",
          "traffic": 73,
          "reviewed": 20,
          "automated": 9,
          "escalated": 5,
          "unsolved": 6,
          "handover": 16,
          "noPrediction": 37
        },
        {
          "intent": "Passord til Mine sider - Altibox",
          "traffic": 53,
          "reviewed": 14,
          "automated": 8,
          "escalated": 4,
          "unsolved": 2,
          "handover": 10,
          "noPrediction": 38
        },
        {
          "intent": "Min side / Mine sider",
          "traffic": 50,
          "reviewed": 17,
          "automated": 3,
          "escalated": 11,
          "unsolved": 3,
          "handover": 19,
          "noPrediction": 32
        }
      ]
    },
    {
      "root": "Strøm",
      "traffic": 1352,
      "reviewed": 398,
      "automated": 223,
      "escalated": 89,
      "unsolved": 86,
      "handover": 123,
      "noPrediction": 965,
      "topIntents": [
        {
          "intent": "Norgespris",
          "traffic": 512,
          "reviewed": 146,
          "automated": 109,
          "escalated": 20,
          "unsolved": 17,
          "handover": 25,
          "noPrediction": 496
        },
        {
          "intent": "Oppsigelse strøm",
          "traffic": 65,
          "reviewed": 21,
          "automated": 2,
          "escalated": 13,
          "unsolved": 6,
          "handover": 22,
          "noPrediction": 51
        },
        {
          "intent": "Bestill strømavtale",
          "traffic": 47,
          "reviewed": 18,
          "automated": 12,
          "escalated": 3,
          "unsolved": 3,
          "handover": 3,
          "noPrediction": 32
        },
        {
          "intent": "Forbruk",
          "traffic": 38,
          "reviewed": 12,
          "automated": 10,
          "escalated": 1,
          "unsolved": 1,
          "handover": 2,
          "noPrediction": 16
        },
        {
          "intent": "Strøm",
          "traffic": 37,
          "reviewed": 8,
          "automated": 1,
          "escalated": 3,
          "unsolved": 4,
          "handover": 6,
          "noPrediction": 14
        },
        {
          "intent": "Flytte strømavtale til en annen",
          "traffic": 29,
          "reviewed": 10,
          "automated": 4,
          "escalated": 1,
          "unsolved": 5,
          "handover": 2,
          "noPrediction": 20
        }
      ]
    },
    {
      "root": "Nettleie",
      "traffic": 751,
      "reviewed": 214,
      "automated": 95,
      "escalated": 59,
      "unsolved": 60,
      "handover": 26,
      "noPrediction": 586,
      "topIntents": [
        {
          "intent": "Strømbrudd",
          "traffic": 210,
          "reviewed": 56,
          "automated": 28,
          "escalated": 1,
          "unsolved": 27,
          "handover": 0,
          "noPrediction": 196
        },
        {
          "intent": "Strømbrudd i by",
          "traffic": 76,
          "reviewed": 21,
          "automated": 10,
          "escalated": 0,
          "unsolved": 11,
          "handover": 0,
          "noPrediction": 66
        },
        {
          "intent": "Fjerne trær",
          "traffic": 35,
          "reviewed": 8,
          "automated": 2,
          "escalated": 6,
          "unsolved": 0,
          "handover": 1,
          "noPrediction": 28
        },
        {
          "intent": "Strømmen forsvant",
          "traffic": 34,
          "reviewed": 12,
          "automated": 9,
          "escalated": 0,
          "unsolved": 3,
          "handover": 0,
          "noPrediction": 31
        },
        {
          "intent": "Noe galt med strømmen?",
          "traffic": 28,
          "reviewed": 8,
          "automated": 3,
          "escalated": 3,
          "unsolved": 2,
          "handover": 1,
          "noPrediction": 21
        },
        {
          "intent": "Ledninger henger fra stolpe",
          "traffic": 24,
          "reviewed": 7,
          "automated": 1,
          "escalated": 6,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 18
        }
      ]
    },
    {
      "root": "Mitt Hjem appen",
      "traffic": 300,
      "reviewed": 82,
      "automated": 36,
      "escalated": 20,
      "unsolved": 26,
      "handover": 69,
      "noPrediction": 177,
      "topIntents": [
        {
          "intent": "Får ikke logget meg inn på Mitt Hjem",
          "traffic": 52,
          "reviewed": 14,
          "automated": 5,
          "escalated": 4,
          "unsolved": 5,
          "handover": 15,
          "noPrediction": 40
        },
        {
          "intent": "Mottar ikke engangskode - Mitt Hjem",
          "traffic": 46,
          "reviewed": 7,
          "automated": 3,
          "escalated": 3,
          "unsolved": 1,
          "handover": 21,
          "noPrediction": 32
        },
        {
          "intent": "Mitt Hjem appen",
          "traffic": 27,
          "reviewed": 4,
          "automated": 1,
          "escalated": 2,
          "unsolved": 1,
          "handover": 5,
          "noPrediction": 10
        },
        {
          "intent": "Mitt Hjem virker ikke",
          "traffic": 19,
          "reviewed": 8,
          "automated": 3,
          "escalated": 2,
          "unsolved": 3,
          "handover": 2,
          "noPrediction": 10
        },
        {
          "intent": "Finner ikke strømforbruket i appen",
          "traffic": 12,
          "reviewed": 2,
          "automated": 0,
          "escalated": 1,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 5
        },
        {
          "intent": "Smart Lading",
          "traffic": 11,
          "reviewed": 4,
          "automated": 4,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 2
        }
      ]
    },
    {
      "root": "KraftPlugg",
      "traffic": 243,
      "reviewed": 74,
      "automated": 44,
      "escalated": 8,
      "unsolved": 22,
      "handover": 16,
      "noPrediction": 169,
      "topIntents": [
        {
          "intent": "Kraftpluggen virker ikke",
          "traffic": 54,
          "reviewed": 22,
          "automated": 13,
          "escalated": 3,
          "unsolved": 6,
          "handover": 4,
          "noPrediction": 50
        },
        {
          "intent": "KraftPlugg",
          "traffic": 35,
          "reviewed": 9,
          "automated": 5,
          "escalated": 0,
          "unsolved": 4,
          "handover": 1,
          "noPrediction": 22
        },
        {
          "intent": "Hvordan åpner jeg HAN-porten?",
          "traffic": 34,
          "reviewed": 13,
          "automated": 11,
          "escalated": 1,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 28
        },
        {
          "intent": "Er HAN åpen?",
          "traffic": 21,
          "reviewed": 3,
          "automated": 3,
          "escalated": 0,
          "unsolved": 0,
          "handover": 3,
          "noPrediction": 10
        },
        {
          "intent": "Hva er en HAN-port?",
          "traffic": 13,
          "reviewed": 5,
          "automated": 2,
          "escalated": 0,
          "unsolved": 3,
          "handover": 0,
          "noPrediction": 8
        },
        {
          "intent": "Installere KraftPlugg",
          "traffic": 10,
          "reviewed": 3,
          "automated": 1,
          "escalated": 0,
          "unsolved": 2,
          "handover": 1,
          "noPrediction": 8
        }
      ]
    },
    {
      "root": "Mørke gatelys",
      "traffic": 203,
      "reviewed": 71,
      "automated": 44,
      "escalated": 9,
      "unsolved": 18,
      "handover": 6,
      "noPrediction": 142,
      "topIntents": [
        {
          "intent": "Mørke gatelys",
          "traffic": 95,
          "reviewed": 33,
          "automated": 23,
          "escalated": 4,
          "unsolved": 6,
          "handover": 5,
          "noPrediction": 70
        },
        {
          "intent": "Gatelys i ustand",
          "traffic": 27,
          "reviewed": 10,
          "automated": 10,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 21
        },
        {
          "intent": "Gatelys blinker",
          "traffic": 10,
          "reviewed": 3,
          "automated": 2,
          "escalated": 0,
          "unsolved": 1,
          "handover": 1,
          "noPrediction": 7
        },
        {
          "intent": "Status på gatelys",
          "traffic": 10,
          "reviewed": 3,
          "automated": 2,
          "escalated": 0,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 7
        },
        {
          "intent": "Eieren av gatelyset",
          "traffic": 8,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 4
        },
        {
          "intent": "Privat gatelys er mørkt",
          "traffic": 8,
          "reviewed": 2,
          "automated": 1,
          "escalated": 0,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 4
        }
      ]
    },
    {
      "root": "Boligselskap",
      "traffic": 134,
      "reviewed": 39,
      "automated": 5,
      "escalated": 18,
      "unsolved": 16,
      "handover": 56,
      "noPrediction": 80,
      "topIntents": [
        {
          "intent": "Overta leilighet i sameie",
          "traffic": 17,
          "reviewed": 8,
          "automated": 0,
          "escalated": 4,
          "unsolved": 4,
          "handover": 9,
          "noPrediction": 15
        },
        {
          "intent": "Altibox boligselskap",
          "traffic": 16,
          "reviewed": 5,
          "automated": 1,
          "escalated": 2,
          "unsolved": 2,
          "handover": 7,
          "noPrediction": 8
        },
        {
          "intent": "Bestille Altibox Boligselskap",
          "traffic": 14,
          "reviewed": 4,
          "automated": 1,
          "escalated": 2,
          "unsolved": 1,
          "handover": 6,
          "noPrediction": 6
        },
        {
          "intent": "Boligselskap",
          "traffic": 12,
          "reviewed": 3,
          "automated": 0,
          "escalated": 1,
          "unsolved": 2,
          "handover": 6,
          "noPrediction": 5
        },
        {
          "intent": "Kan jeg få fellesavtale boligselskap",
          "traffic": 8,
          "reviewed": 3,
          "automated": 0,
          "escalated": 2,
          "unsolved": 1,
          "handover": 5,
          "noPrediction": 5
        },
        {
          "intent": "Tilgang til internett i boligselskap",
          "traffic": 8,
          "reviewed": 3,
          "automated": 1,
          "escalated": 2,
          "unsolved": 0,
          "handover": 5,
          "noPrediction": 5
        }
      ]
    },
    {
      "root": "Bedrift",
      "traffic": 121,
      "reviewed": 38,
      "automated": 11,
      "escalated": 16,
      "unsolved": 11,
      "handover": 40,
      "noPrediction": 63,
      "topIntents": [
        {
          "intent": "Bedrift",
          "traffic": 18,
          "reviewed": 7,
          "automated": 4,
          "escalated": 2,
          "unsolved": 1,
          "handover": 2,
          "noPrediction": 8
        },
        {
          "intent": "Sette privatabonnement over på bedrift",
          "traffic": 11,
          "reviewed": 2,
          "automated": 0,
          "escalated": 1,
          "unsolved": 1,
          "handover": 2,
          "noPrediction": 7
        },
        {
          "intent": "Rådgivere for boligselskap",
          "traffic": 9,
          "reviewed": 3,
          "automated": 0,
          "escalated": 3,
          "unsolved": 0,
          "handover": 8,
          "noPrediction": 7
        },
        {
          "intent": "Kontakt bedriftsrådgiver",
          "traffic": 9,
          "reviewed": 1,
          "automated": 0,
          "escalated": 0,
          "unsolved": 1,
          "handover": 2,
          "noPrediction": 4
        },
        {
          "intent": "Rådgivere for bedriftsbredbånd",
          "traffic": 7,
          "reviewed": 1,
          "automated": 0,
          "escalated": 1,
          "unsolved": 0,
          "handover": 3,
          "noPrediction": 2
        },
        {
          "intent": "Skifte juridisk eier bedrift",
          "traffic": 6,
          "reviewed": 3,
          "automated": 0,
          "escalated": 2,
          "unsolved": 1,
          "handover": 5,
          "noPrediction": 6
        }
      ]
    },
    {
      "root": "Elbillader",
      "traffic": 120,
      "reviewed": 44,
      "automated": 18,
      "escalated": 8,
      "unsolved": 18,
      "handover": 7,
      "noPrediction": 71,
      "topIntents": [
        {
          "intent": "Elbillader",
          "traffic": 37,
          "reviewed": 13,
          "automated": 8,
          "escalated": 1,
          "unsolved": 4,
          "handover": 3,
          "noPrediction": 28
        },
        {
          "intent": "Bestille elbillader",
          "traffic": 15,
          "reviewed": 6,
          "automated": 3,
          "escalated": 1,
          "unsolved": 2,
          "handover": 1,
          "noPrediction": 12
        },
        {
          "intent": "Installere elbillader",
          "traffic": 7,
          "reviewed": 2,
          "automated": 1,
          "escalated": 0,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 5
        },
        {
          "intent": "Ønsker elbillader",
          "traffic": 6,
          "reviewed": 2,
          "automated": 0,
          "escalated": 0,
          "unsolved": 2,
          "handover": 0,
          "noPrediction": 3
        },
        {
          "intent": "Pris elbillader",
          "traffic": 6,
          "reviewed": 3,
          "automated": 1,
          "escalated": 0,
          "unsolved": 2,
          "handover": 0,
          "noPrediction": 4
        },
        {
          "intent": "Easee-lader er ødelagt",
          "traffic": 5,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 1,
          "noPrediction": 3
        }
      ]
    },
    {
      "root": "Solceller",
      "traffic": 44,
      "reviewed": 14,
      "automated": 4,
      "escalated": 4,
      "unsolved": 6,
      "handover": 6,
      "noPrediction": 26,
      "topIntents": [
        {
          "intent": "Solceller",
          "traffic": 14,
          "reviewed": 2,
          "automated": 0,
          "escalated": 1,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 13
        },
        {
          "intent": "Hvor mye kraft produserer jeg?",
          "traffic": 8,
          "reviewed": 2,
          "automated": 1,
          "escalated": 1,
          "unsolved": 0,
          "handover": 1,
          "noPrediction": 2
        },
        {
          "intent": "Problemer med inverteren",
          "traffic": 4,
          "reviewed": 1,
          "automated": 0,
          "escalated": 0,
          "unsolved": 1,
          "handover": 1,
          "noPrediction": 3
        },
        {
          "intent": "Solcellene virker ikke",
          "traffic": 4,
          "reviewed": 2,
          "automated": 0,
          "escalated": 1,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 1
        },
        {
          "intent": "E-post om årsoppgave",
          "traffic": 3,
          "reviewed": 2,
          "automated": 1,
          "escalated": 0,
          "unsolved": 1,
          "handover": 1,
          "noPrediction": 3
        },
        {
          "intent": "Kan jeg bruke egenprodusert strøm dersom strømmen går?",
          "traffic": 3,
          "reviewed": 2,
          "automated": 0,
          "escalated": 0,
          "unsolved": 2,
          "handover": 0,
          "noPrediction": 1
        }
      ]
    },
    {
      "root": "Varmepumpe",
      "traffic": 20,
      "reviewed": 5,
      "automated": 3,
      "escalated": 2,
      "unsolved": 0,
      "handover": 5,
      "noPrediction": 7,
      "topIntents": [
        {
          "intent": "Varmepumpe",
          "traffic": 4,
          "reviewed": 2,
          "automated": 1,
          "escalated": 1,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 3
        },
        {
          "intent": "Feil på varmepumpe",
          "traffic": 3,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 1,
          "noPrediction": 1
        },
        {
          "intent": "Bestille varmepumpe",
          "traffic": 2,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 1
        },
        {
          "intent": "App til varmepumpe",
          "traffic": 1,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 1,
          "noPrediction": 0
        },
        {
          "intent": "Hvorfor slutter Haugaland Kraft å selge varmepumper?",
          "traffic": 1,
          "reviewed": 1,
          "automated": 1,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 0
        },
        {
          "intent": "Koble varmepumpen til WiFi",
          "traffic": 1,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 0
        }
      ]
    },
    {
      "root": "Alarm",
      "traffic": 8,
      "reviewed": 4,
      "automated": 3,
      "escalated": 0,
      "unsolved": 1,
      "handover": 0,
      "noPrediction": 7,
      "topIntents": [
        {
          "intent": "Alarm",
          "traffic": 3,
          "reviewed": 2,
          "automated": 2,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 3
        },
        {
          "intent": "Tilbyr dere alarm?",
          "traffic": 2,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 2
        },
        {
          "intent": "Hjelp med alarm",
          "traffic": 1,
          "reviewed": 0,
          "automated": 0,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 1
        },
        {
          "intent": "Kamera-løsninger",
          "traffic": 1,
          "reviewed": 1,
          "automated": 0,
          "escalated": 0,
          "unsolved": 1,
          "handover": 0,
          "noPrediction": 0
        },
        {
          "intent": "Kontakt alarm",
          "traffic": 1,
          "reviewed": 1,
          "automated": 1,
          "escalated": 0,
          "unsolved": 0,
          "handover": 0,
          "noPrediction": 1
        }
      ]
    }
  ]
};
