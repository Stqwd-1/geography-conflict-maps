const SPECIAL_FLAGS = {
  ussr: 'Flag_of_the_Soviet_Union.svg',
  rsfsr: 'Flag_of_Russian_SFSR.svg',
  'ru-imperial': 'Flag_of_Russia_(1858–1896).svg',
  ottoman: 'Flag_of_the_Ottoman_Empire.svg',
  'east-india': 'Flag_of_the_British_East_India_Company_(1801).svg',
  qing: 'Flag_of_the_Qing_dynasty_(1889-1912).svg',
  'austrian-empire': 'Flag_of_the_Habsburg_Monarchy.svg',
  prussia: 'Flag_of_Prussia_(1892-1918).svg',
  'german-empire': 'Flag_of_the_German_Empire.svg',
  'japan-empire': 'Naval_Ensign_of_Japan.svg',
  yugoslavia: 'Flag_of_Yugoslavia_(1946–1992).svg',
  'ethiopia-empire': 'Flag_of_Ethiopia_(1897-1974).svg',
  'brazil-empire': 'Flag_of_Empire_of_Brazil_(1847-1889).svg',
  'spanish-empire': 'Flag_of_Cross_of_Burgundy.svg',
  qajar: 'Flag_of_Qajar_(1910-1925).png',
  texas: 'Flag_of_Texas.svg',
  csa: 'Flag_of_the_Confederate_States_of_America_(1861-1863).svg',
  'union-usa': 'Flag_of_the_United_States_(1861-1863).svg',
  'north-vietnam': 'Flag_of_North_Vietnam.svg',
  'south-vietnam': 'Flag_of_South_Vietnam.svg',
  vietcong: 'FNL_Flag.svg',
  'khmer-republic': 'Flag_of_the_Khmer_Republic.svg',
  'dem-kampuchea': 'Flag_of_Democratic_Kampuchea.svg',
  prk: "Flag_of_the_People's_Republic_of_Kampuchea.svg",
  drafgan: 'Flag_of_Afghanistan_(1978–1980).svg',
  roc: 'Flag_of_the_Republic_of_China.svg',
  rhodesia: 'Flag_of_Rhodesia.svg',
  ichkeria: 'Flag_of_Chechen_Republic_of_Ichkeria.svg',
  artsakh: 'Flag_of_Artsakh.svg',
  biafra: 'Flag_of_Biafra.svg',
  transvaal: 'Flag_of_Transvaal.svg',
  'orange-fs': 'Flag_of_the_Orange_Free_State.svg',
  'south-ossetia': 'Flag_of_South_Ossetia.svg',
  abkhazia: 'Flag_of_Abkhazia.svg',
  transnistria: 'Flag_of_Transnistria.svg',
};

function flagSrc(flag) {
  const file = SPECIAL_FLAGS[flag];
  if (file) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=40`;
  return `https://flagcdn.com/w40/${flag.toLowerCase()}.png`;
}

export { flagSrc };