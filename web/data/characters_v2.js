window.CHARACTER_V2 = {
  "00_Intro": {
    summary: "2 版（2nd Edition）針對 1 版玩家能力卡、同伴卡、牧師玩家圖板與規則書進行了全面平衡修正與文字釐清。",
    changes: [
      ["規則書重大改動", "火格（Fire Tiles, ERB p9）、戰利品（Looting, ERB p24）、反應（Reactions, ERB p15）、女獵手巨鷹（Huntress Falcons, ERB p32，多張卡射程由 4 提升為 5）。"],
      ["移除與新增能力卡", "劍士（Blade）移除 Weapon Throw、Cross Cut、Somersault → 新增 Flurry（2 級）、Piercing Fang（5 級）、Unbalance（5 級）。女獵手（Huntress）移除 Piercing Arrow → 新增 Hunter's Mark（10 級）。"],
      ["玩家圖板替換", "牧師（The Priest）需替換新版玩家圖板。"]
    ],
    cards: []
  },
  "01_Warden": {
    summary: "典獄長（The Warden）2 版共修正 5 張行動卡與 1 張橫式同伴卡。",
    changes: [
      ["行動卡修正（5 張）", "As One!（2 級）、Chained（10 級，移動 2 鄰接目標降 1 防）、Claimed Ground（1 費）、Shield Bash（3 費，撞到友軍不扣血）、Stand Fast!（2 級，任意時機給 3 格內友軍 1 防禦指示物）。"],
      ["同伴卡修正（1 張）", "Chained / Claimed Ground（5 級雙面同伴卡，每輪各特殊能力限用 1 次）。"]
    ],
    cards: Array.from({length: 6}, (_, i) => `assets/characters_v2/01_Warden_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "02_Ursus": {
    summary: "戰熊（The Ursus Warbear）2 版共修正 3 張行動卡與 2 張橫式同伴卡。",
    changes: [
      ["行動卡修正（3 張）", "Feeding Frenzy（5 級，本階段尚未攻擊過才可打出，造成至少 2 血或擊殺則回 1 血並結束本階段行動，仍可用打斷）、Topple（10 級，徒手攻擊障礙物總傷達 6+ 放置 7 格 AoE 模板造成扣血後移除障礙物）、Warpath（15 級，Charge Through 4, Empowered x2）。"],
      ["同伴卡修正（2 張）", "Primal Rage / Bite（10 級雙面同伴卡）、Toss / War Path（15 級雙面同伴卡）。"]
    ],
    cards: Array.from({length: 5}, (_, i) => `assets/characters_v2/02_Ursus_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "03_Witch": {
    summary: "巫者（The Witch）2 版共修正 17 張行動卡與 1 張橫式同伴卡（含火格規則調整）。",
    changes: [
      ["行動卡修正（17 張）", "Comet、Elemental Suffusion、Elemental Weapon（10 級）、Encapsulate、Fireflies、Fire Storm（15 級）、Firewall（2 級）、Glacial Shield（10 級）、Hoarfrost（10 級）、Ice Spike、Ice Wall（2 級）、Lash Out（0 費）、Lightning Rod（5 級）、Lightning Storm（15 級）、Supernova（10 級）、Telekine Implosion（15 級）、Telekinesis（2 級）。"],
      ["同伴卡修正（1 張）", "Telekine Implosion / Telekinesis（15 級雙面同伴卡）。"]
    ],
    cards: Array.from({length: 18}, (_, i) => `assets/characters_v2/03_Witch_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "04_Priest": {
    summary: "牧師（The Priest）2 版需替換新版玩家圖板，並修正 10 張行動卡與 3 張橫式同伴卡。",
    changes: [
      ["玩家圖板替換", "請以 2 版新版牧師玩家圖板取代 1 版圖板。"],
      ["行動卡修正（10 張）", "Desperate Prayer（難度＝目標血量 +2）、Heavy Blow（0 費）、Lay on Hands（2 級）、Martyr（2 級）、Prayer of Protection（3 格內 +3 藍盾，若成功減傷則自損 1 血）、Sanctify（10 級）、Transfiguration（5 級，移除 2 格相鄰雜魚）、Vitality Aura（15 級）、Weight of Glory、Zeal（10 級）。"],
      ["同伴卡修正（3 張）", "Desperate Prayer / Blessing（初始雙面同伴卡）、Righteous Advance / Pillar and Path（5 級雙面同伴卡）、Vitality Aura / Zeal（15 級雙面同伴卡）。"]
    ],
    cards: Array.from({length: 13}, (_, i) => `assets/characters_v2/04_Priest_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "05_Ranger": {
    summary: "樹人族遊俠（The A'Dendri Ranger）2 版共修正 5 張行動卡與 4 張橫式同伴卡。",
    changes: [
      ["行動卡修正（5 張）", "Bait and Switch（5 級）、Double Stab（2 級，近戰相鄰雙擊，忽略最高力量牌）、Longshot（超過射程 4 每格 +1 傷）、Quickshot（1 費移動 2 或必打雜魚）、Ricochet（2 費，4 格內多目標平分傷害）。"],
      ["同伴卡修正（4 張）", "Bodkin / Flensing Arrow（10 級）、Disarming Shot / Poison Tipped Arrow（15 級）、Disarming Shot / Quick Shot（5 級）、Tree Run / Ricochet（初始雙面同伴卡）。"]
    ],
    cards: Array.from({length: 9}, (_, i) => `assets/characters_v2/05_Ranger_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "06_Exile": {
    summary: "傷疤部族流亡者（The Scar Tribe Exile）2 版共修正 8 張行動卡與 3 張橫式同伴卡。",
    changes: [
      ["行動卡修正（8 張）", "Berserk（10 級）、Death from Above（相鄰障礙物躍至 7 格內空格 +2 傷）、Feral Charge（10 級，Chain 2 最多 4 目標，開過 Open Wounds 變 Chain 3 且不減牌）、Hurl（5 級）、Line Breaker（2 級，Charge Through 4，殺 2+ 敵回 2 靈氣）、Reap（1 費前弧 3 格 AoE）、Roaring Charge（隊友移 1＋自己直線移 4）、Swiftness（5 級）。"],
      ["同伴卡修正（3 張）", "Roaring Charge / Reap（初始）、Rake / Headbutt（5 級）、Devastate / Headbutt（15 級）。"]
    ],
    cards: Array.from({length: 11}, (_, i) => `assets/characters_v2/06_Exile_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "07_Cur": {
    summary: "滑頭（The Cur）2 版共修正 2 張行動卡與 3 張橫式同伴卡。",
    changes: [
      ["行動卡修正（2 張）", "Shadow Run（15 級，Chain Range 2 最多 4 目標，每 2 名敵人扣血獲得 1 枚骷髏）、Throwing Daggers（1 費 Range 3 徒手攻擊最多 2 目標，任一扣血獲 1 枚骷髏）。"],
      ["同伴卡修正（3 張）", "Backstab / Throwing Daggers（初始）、Death of a Thousand Cuts / Bloodthorn（10 級）、Amber Bomb / Low Blow（15 級）。"]
    ],
    cards: Array.from({length: 5}, (_, i) => `assets/characters_v2/07_Cur_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "08_Penitent": {
    summary: "懺悔者（The Penitent）2 版共修正 5 張行動卡與 2 張橫式同伴卡。",
    changes: [
      ["行動卡修正（5 張）", "Blessing（5 級，3 格內 2 名友軍獲重抽／強化／防禦，3 血以下減 1 費）、Intercession（1 費相鄰治療並自損 1 血）、Shield Bash（Knockback 3）、Taunt（6 格內強迫敵人改打自己）、Zeal（10 級，抽到高於目前血量的牌可再攻一次）。"],
      ["同伴卡修正（2 張）", "Intervention / Zeal（10 級雙面同伴卡）、Taunt / Revenge（5 級雙面同伴卡）。"]
    ],
    cards: Array.from({length: 7}, (_, i) => `assets/characters_v2/08_Penitent_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "09_Harbinger": {
    summary: "翼民預兆者（The Avi Harbinger）2 版共修正 12 張行動卡與 3 張橫式同伴卡。",
    changes: [
      ["行動卡修正（12 張）", "Backstab、Dodge（10 級）、Fateweaver（15 級）、Foreshadowing（2 級）、One Soul、Prescient Strike、Prophetic Fulfilment、Quickening（5 級）、Quill Throw（2 級）、Soultie（10 級）、Syphon Spirit（5 級）、Wingslam。"],
      ["同伴卡修正（3 張）", "Prophetic Fulfilment / Syphon Spirit（10 級）、Precient Strike / Windwalk（15 級）、Prophetic Fulfilment / Quill Throw（初始）。"]
    ],
    cards: Array.from({length: 15}, (_, i) => `assets/characters_v2/09_Harbinger_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "10_Blade": {
    summary: "劍士（The Blade）是 2 版改動最大的職業之一：移除 3 張舊卡、新增 3 張全新行動卡，並修正 9 張行動卡與 2 張同伴卡。",
    changes: [
      ["移除舊卡（3 張）", "移除 1 版的 Weapon Throw、Cross Cut、Somersault。"],
      ["新增 2 版新卡（3 張）", "Flurry（2 級，1 費 2 冷卻，暴擊且無空白時追加一次攻擊，毒蛇架式允許 1 空白）、Piercing Fang（5 級，每種不同數字牌面 +1 傷，毒蛇架式減 1 費）、Unbalance（5 級，2 費徒手，扣血即任意移動目標 2 格，毒蛇架式移除徒手關鍵字）。"],
      ["修正行動卡（9 張）＆同伴卡（2 張）", "行動卡：Blade Dance（10 級）、Charging Boar、Cleaving Slide、Master Parry、Mule's Regard、Nightfall（10 級）、Rising Tusk（2 級）、Roll、Winnowing Strike。同伴卡：Blade Dance / Rising Tusk（10 級）、Blade Call / Charging Boar（15 級）。"]
    ],
    cards: Array.from({length: 14}, (_, i) => `assets/characters_v2/10_Blade_v2_${String(i+1).padStart(2,'0')}.jpg`)
  },
  "11_GroveMaiden": {
    summary: "樹人族林地少女（The Grove Maiden）2 版僅修正 1 張行動卡。",
    changes: [
      ["行動卡修正（1 張）", "Life Bloom（2 費，遠古守護者失去所有生命值，其 2 格內所有角色獲得 2 靈氣；若為同伴則改獲 2 靈氣指示物）。"]
    ],
    cards: ["assets/characters_v2/11_GroveMaiden_v2_01.jpg"]
  },
  "12_Huntress": {
    summary: "女獵手（The Huntress）2 版移除 1 張舊卡、新增 1 張新卡，並修正 13 張行動卡與 1 張同伴卡（巨鷹射程普遍由 4 提升至 5）。",
    changes: [
      ["移除舊卡 → 新增 2 版新卡", "移除 1 版的 Piercing Arrow → 新增 Hunter's Mark（10 級，需弓，1 費 1 冷卻，派 1 巨鷹至 5 格內目標並放置重抽指示物供任一守誓者使用）。"],
      ["修正行動卡（13 張）＆同伴卡（1 張）", "行動卡：Clamp On、Eagle Eye Shot（5 級）、Eye Gouge（10 級）、Falcon Strike（15 級）、Flank Attack（5 級）、Flight of Feathers、Hinder、Hunter's Call、Rile and Rake、Swoop、Tandem Strike（2 級）、Under the Wing（5 級）、Whistling Arrow（2 級）。同伴卡：Under the Wing / Flight of Feathers（5 級）。"]
    ],
    cards: Array.from({length: 15}, (_, i) => `assets/characters_v2/12_Huntress_v2_${String(i+1).padStart(2,'0')}.jpg`)
  }
};
