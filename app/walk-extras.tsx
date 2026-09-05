'use client';
/* eslint-disable next/no-img-element -- Local user-selected photo previews. */
import { useState } from 'react';
import { Camera, Leaf, MapPin, PawPrint, Check } from 'lucide-react';
import {
  petNetwork,
  type Place,
  type Walk,
  type WalkMemory,
} from './walk-model';
import { photos } from './demo-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function PhotoInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState('');
  return (
    <div className="memory-photo-field">
      {value && <img src={value} alt="这次出门的记忆照" />}
      <label className="secondary">
        <Camera size={17} />
        {value ? '换一张照片' : '加一张记忆照'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (
              !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
              f.size > 1024 * 1024
            ) {
              setError('请选择小于 1 MB 的 JPG、PNG 或 WebP。');
              return;
            }
            setError('');
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') onChange(reader.result);
            };
            reader.onerror = () => setError('读取失败，请重试。');
            reader.readAsDataURL(f);
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="text-link"
          onClick={() => onChange('')}
        >
          移除照片
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
const blankMemory: WalkMemory = {
  ownerMood: '',
  petMood: '',
  note: '',
  photo: '',
  metPetIds: [],
};
export function MemoryEditor({
  walk,
  placeName,
  petName,
  buddyIds,
  onSave,
}: {
  walk: Walk;
  placeName: string;
  petName: string;
  buddyIds: string[];
  onSave: (memory: WalkMemory) => void;
}) {
  const [memory, setMemory] = useState<WalkMemory>(walk.memory || blankMemory);
  const patch = (p: Partial<WalkMemory>) => setMemory((s) => ({ ...s, ...p }));
  return (
    <form
      className="memory-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(memory);
      }}
    >
      <div className="memory-heading">
        <Leaf size={22} />
        <div>
          <strong>{placeName}</strong>
          <p>
            {new Date(walk.startedAt).toLocaleDateString('zh-CN')} · 和{' '}
            {petName} 一起
          </p>
        </div>
      </div>
      <PhotoInput value={memory.photo} onChange={(photo) => patch({ photo })} />
      <div className="mood-pair">
        {(
          [
            {
              key: 'ownerMood',
              label: '今天的我',
              items: ['放松了一点', '被陪伴了', '走得很尽兴'],
            },
            {
              key: 'petMood',
              label: '今天的 TA',
              items: ['嗅闻探险家', '交到朋友啦', '慢慢熟悉中'],
            },
          ] as const
        ).map((group) => (
          <fieldset key={group.key}>
            <legend>{group.label}</legend>
            <div className="mood-options">
              {group.items.map((mood) => (
                <button
                  type="button"
                  key={mood}
                  aria-pressed={memory[group.key] === mood}
                  onClick={() =>
                    patch({
                      [group.key]: memory[group.key] === mood ? '' : mood,
                    })
                  }
                >
                  {mood}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <fieldset>
        <legend>今天真的遇见了谁？</legend>
        <p className="muted-copy">
          亲自遇见后再记上。同在一个地点，不会自动算作相遇。
        </p>
        <div className="met-pets">
          {petNetwork
            .filter((p) => buddyIds.includes(p.id))
            .map((p) => (
              <button
                type="button"
                key={p.id}
                aria-pressed={memory.metPetIds.includes(p.id)}
                onClick={() =>
                  patch({
                    metPetIds: memory.metPetIds.includes(p.id)
                      ? memory.metPetIds.filter((id) => id !== p.id)
                      : [...memory.metPetIds, p.id],
                  })
                }
              >
                <img src={photos[p.photo]} alt="" />
                {p.name}
                {memory.metPetIds.includes(p.id) && <Check size={14} />}
              </button>
            ))}
        </div>
      </fieldset>
      <label className="form-field">
        <span>记住一个小瞬间</span>
        <textarea
          value={memory.note}
          maxLength={300}
          rows={3}
          placeholder="今天闻到了新草地的味道，也认识了一个小伙伴……"
          onChange={(e) => patch({ note: e.target.value })}
        />
      </label>
      <p className="demo-footnote">
        这页回忆仅自己可见，不会自动发布到宠友圈。
      </p>
      <button className="primary full-width" type="submit">
        <PawPrint size={17} />
        收进陪伴日历
      </button>
    </form>
  );
}
export function PlaceContribution({
  onSave,
  anchor,
}: {
  anchor?: Place;
  onSave: (place: Place) => void;
}) {
  const [name, setName] = useState(anchor?.name || '');
  const [address, setAddress] = useState(anchor?.area || '');
  const [kind, setKind] = useState<Place['kind']>(anchor?.kind || '草地公园');
  const [desc, setDesc] = useState(
    anchor?.experience?.note || (anchor?.contributed ? anchor.desc : ''),
  );
  const [photo, setPhoto] = useState(anchor?.photoUrl || '');
  const [features, setFeatures] = useState<string[]>(
    anchor?.experience?.features || ['全程牵绳'],
  );
  return (
    <form
      className="contribute-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !address.trim() || !desc.trim()) return;
        onSave({
          id: anchor?.id || crypto.randomUUID(),
          name: name.trim(),
          area: address.trim(),
          location: anchor?.location,
          source: anchor?.source,
          kind,
          desc: desc.trim(),
          features: features.length ? features : ['设施待核实'],
          caution: '宠友补充，尚未核实。入园范围、牵绳及开放要求请向场地确认。',
          size: '待核实',
          distance: '待核实',
          minutes: 0,
          x: 0,
          y: 0,
          route: '尚未核实入口及步行路线。',
          photo: 'park',
          photoUrl: photo,
          quiet: features.includes('人少安静'),
          contributed: true,
          experience: {
            note: desc.trim(),
            features: features.length ? features : ['设施待核实'],
            updatedAt: Date.now(),
          },
        });
      }}
    >
      <div className="gentle-note">
        <MapPin size={20} />
        <p>分享你和毛孩子发现的好去处，让北京多一个可以出门的理由。</p>
      </div>
      <label className="form-field">
        <span>地点名称 *</span>
        <input
          required
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：家附近的河畔草地"
        />
      </label>
      <label className="form-field">
        <span>地址与入口 *</span>
        <input
          required
          maxLength={80}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="哪个区、哪条路，从哪里进入"
        />
      </label>
      <div className="form-field">
        <span>地点类型</span>
        <Select
          value={kind}
          onValueChange={(v) => v && setKind(v as Place['kind'])}
        >
          <SelectTrigger aria-label="贡献地点类型">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['草地公园', '河畔步道', '友好店铺'].map((v) => (
              <SelectItem value={v} key={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="demo-footnote">
        已绑定所选高德地点的真实坐标。入口细节可在上方地址中补充。
      </p>
      <fieldset>
        <legend>你看到的环境</legend>
        <div className="mood-options">
          {[
            '全程牵绳',
            '有遮阴',
            '有饮水',
            '开阔草地',
            '人少安静',
            '户外座位',
          ].map((f) => (
            <button
              type="button"
              key={f}
              aria-pressed={features.includes(f)}
              onClick={() =>
                setFeatures((s) =>
                  s.includes(f) ? s.filter((x) => x !== f) : [...s, f],
                )
              }
            >
              {f}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="form-field">
        <span>现场体验与携宠要求 *</span>
        <textarea
          required
          rows={3}
          maxLength={300}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="适合怎样的宠物？现场有没有携宠提示牌？"
        />
      </label>
      <PhotoInput value={photo} onChange={setPhoto} />
      <p className="demo-footnote">
        体验仅保存在此浏览器，以“待核实”显示，不会自动认定此地点允许携宠。
      </p>
      <button type="submit" className="primary full-width">
        保存我的地点
        <Check size={17} />
      </button>
    </form>
  );
}
