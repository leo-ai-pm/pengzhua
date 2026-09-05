import type { Place } from './walk-model';

// Coordinates/POI IDs: AMap GCJ-02 lookup on 2026-09-05.
// Pet admission is supported separately by the linked publications, not by POI inclusion.
const common = {
  kind: '草地公园' as const, source: 'amap' as const,
  distance: '待定位', minutes: 0, x: 0, y: 0, route: '',
  photo: 'park' as const, quiet: false, size: '按场地要求确认',
};
export const beijingPlaces: Place[] = [
  {
    ...common, id: 'amap-B0I1HHRRUH', name: '爪吧宠物乐园（温榆河示范区店）',
    area: '朝阳区 · 孙河乡来广营北路2号院27幢一层',
    location: [116.477011, 40.072945],
    desc: '带狗狗去专属乐园玩一会儿。公开介绍包含草地和宠物游乐设施，适合一次专门的携宠出游。',
    features: ['宠物专属乐园', '草地活动', '收费场地'],
    caution: '仅收录爪吧乐园，不代表温榆河公园全园可携犬。',
    petGuide: {
      district: '朝阳', badge: '宠物专属', fee: '收费 · 票价与预约以场地当日信息为准',
      entry: '选择“温榆河示范区店”，靠近东园4号门、P4停车场；携宠请确认乐园入口，不要误去二期店。',
      rules: ['携带有效期内的疫苗证明。', '遵守场地牵引规则；泳池等项目是否开放请向乐园确认。'],
      checkedAt: '2026-09-05',
      sources: [
        { title: '温榆河公园官方微博 · 示范区4号门攻略（新浪页面）', url: 'https://www.sina.cn/news/detail/5263355868876814.html', publishedAt: '2026-02-06' },
        { title: '石景山区政府 · 携犬入园问答', url: 'https://www.bjsjs.gov.cn/gongkai/zwgkpd/ztzl/2025/wmyqyjs/cjwd/202603/t20260302_759176.shtml', publishedAt: '2026-06-22' },
      ],
    },
  },
  {
    ...common, id: 'amap-B000A85T0O', name: '老山城市休闲公园',
    area: '石景山区 · 老山南路与上庄大街交叉口西北侧',
    location: [116.224446, 39.914890],
    desc: '想带狗狗走走山林步道，可以从这里开始。公园有自然山地，按自己和狗狗的体力安排路程。',
    features: ['牵绳散步', '山林步道', '免费公园'],
    caution: '有坡地，按体力选路；避开封闭区域及骑行活动区。',
    petGuide: {
      district: '石景山', badge: '牵绳友好', fee: '公开信息为免费 · 开放安排以现场为准',
      entry: '地图标记为公园POI，并非已实勘入口；抵达后根据现场门区指引进入。',
      rules: ['北京旅游网明确提示：带宠物入园须牵绳，不影响其他游客。', '及时清理排泄物；出发前确认当天携宠要求。'],
      checkedAt: '2026-09-05',
      sources: [
        { title: '北京旅游网 · 北京5个宠物友好公园推荐', url: 'https://www.visitbeijing.com.cn/article/4OhGr6pqBtk', publishedAt: '2025-10-12' },
        { title: '北京市园林绿化局 · 老山城市休闲公园', url: 'https://yllhj.beijing.gov.cn/ggfw/bjsggml/zlgy/sjsq/202206/t20220615_2741640.shtml' },
      ],
    },
  },
  {
    ...common, id: 'amap-B0L127V53H', name: '狼垡城市森林公园·宠物友好专区',
    area: '大兴区 · 芦求路与京良路交叉口南约180米',
    location: [116.273504, 39.768381],
    desc: '在独立划分的宠物活动空间里散步。公开报道介绍了专区步道、停车场和公共卫生间。',
    features: ['独立宠物专区', '健身步道', '免费公园'],
    caution: '仅限宠物友好专区，不代表狼垡城市森林公园所有区域开放携宠。',
    petGuide: {
      district: '大兴', badge: '仅限专区', fee: '公开推荐为免费 · 现场管理与开放时间需确认',
      entry: '高德对应“宠物友好公园”，位于芦求路与京良路交叉口南侧；请按宠物专区入口指示通行。',
      rules: ['携带养犬登记证及有效疫苗证明；犬种须符合场地准入要求。', '主人全程看管、及时清理排泄物；牵引要求以专区公示为准。'],
      checkedAt: '2026-09-05',
      sources: [
        { title: '首都文明网 · 大兴首个宠物友好公园开放', url: 'https://www.bjwmb.gov.cn/wmdt/dxq/10110050.html', publishedAt: '2025-10-09' },
        { title: '北京旅游网 · 入园须知', url: 'https://www.visitbeijing.com.cn/article/4OhGr6pqBtk', publishedAt: '2025-10-12' },
      ],
    },
  },
  {
    ...common, id: 'amap-B000A849EB', name: 'CKC国际宠物公园',
    area: '通州区 · 宋庄镇大邓各庄村西南角',
    location: [116.752968, 39.916461],
    desc: '以犬类活动为主题的宠物公园，适合计划一次郊区出游。园内宠物游泳等项目需另行确认。',
    features: ['宠物主题公园', '郊区出游', '部分项目收费'],
    caution: '当天营业、入园费用、疫苗及犬种要求请先向场地确认；泳池开放随季节调整。',
    petGuide: {
      district: '通州', badge: '宠物专属', fee: '部分项目收费 · 不将旧版泳池价格作为现价',
      entry: '导航到CKC国际宠物公园POI；园内入口及可活动范围按场地指引确认。',
      rules: ['出发前向场地核对犬种、疫苗、预约及牵引要求。', '普通户外活动与泳池项目分开确认，不默认允许全场脱绳。'],
      checkedAt: '2026-09-05',
      sources: [
        { title: '北京旅游网 · CKC国际宠物公园介绍', url: 'https://s.visitbeijing.com.cn/index.php/attraction/118317' },
        { title: '北京旅游网 · 宠物友好公园推荐', url: 'https://www.visitbeijing.com.cn/article/4OhGr6pqBtk', publishedAt: '2025-10-12' },
      ],
    },
  },
];

/** Stable provider IDs prevent duplicates after search/save or an older local copy. */
export function withBeijingPlaces(custom: Place[]): Place[] {
  const catalog = new Map(custom.map((p) => [p.id, p]));
  for (const place of beijingPlaces) catalog.set(place.id, {
    ...catalog.get(place.id), ...place,
  });
  return [...catalog.values()];
}
