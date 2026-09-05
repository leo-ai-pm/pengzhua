'use client';
/* eslint-disable next/no-img-element -- QR image is generated locally. */
import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  ImagePlus,
  QrCode,
  Download,
  ScanLine,
  ShieldCheck,
  X,
} from 'lucide-react';
import { encodePetCode, parsePetCode } from './pet-code';

export function PetCodeCard({
  name,
  breed,
  petId = 'me',
}: {
  name: string;
  breed: string;
  petId?: string;
}) {
  const [image, setImage] = useState('');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    import('qrcode')
      .then((qr) =>
        qr.toDataURL(encodePetCode(petId), {
          width: 640,
          margin: 3,
          errorCorrectionLevel: 'M',
          color: { dark: '#244539', light: '#ffffff' },
        }),
      )
      .then((url) => {
        if (active) setImage(url);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [petId, attempt]);
  return (
    <div className="pet-code-view">
      <div className="pet-code-card">
        <span className="pet-code-overline">碰爪 · 让朋友找到它</span>
        <h2>{name}的碰爪码</h2>
        <p>{breed} · 先认识，再一起出门</p>
        <div className="pet-qr-paper">
          {image ? (
            <img src={image} alt={`${name}的演示碰爪二维码`} />
          ) : failed ? (
            <button
              onClick={() => {
                setFailed(false);
                setAttempt((a) => a + 1);
              }}
            >
              生成失败，点此重试
            </button>
          ) : (
            <output>正在生成碰爪码…</output>
          )}
        </div>
        <strong>见面时，亮出你的碰爪码</strong>
        <p>扫一扫，查看宠物名片并申请好友。</p>
        <span className="pet-code-demo">演示名片 · 暂不跨账号添加</span>
      </div>
      {image && (
        <a
          className="pet-code-download"
          href={image}
          download={`碰爪-${name}-演示伙伴码.png`}
        >
          <Download size={18} />
          保存碰爪码
        </a>
      )}
    </div>
  );
}

export function PetScanner({
  onRecognized,
  onMyCode,
}: {
  onRecognized: (id: string) => void;
  onMyCode?: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const frame = useRef<number>(0);
  const generation = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'scanning' | 'reading' | 'error'
  >('idle');
  const [message, setMessage] = useState('对准朋友的碰爪码，认识新的毛孩子。');
  const resolved = useRef(onRecognized);
  useEffect(() => {
    resolved.current = onRecognized;
  }, [onRecognized]);
  function release() {
    generation.current++;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }
  useEffect(() => {
    function hide() {
      if (document.hidden) {
        release();
        setStatus('idle');
        setMessage('已暂停摄像头，回来后可以重新开启。');
      }
    }
    document.addEventListener('visibilitychange', hide);
    return () => {
      release();
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  function accept(value: string) {
    release();
    const id = parsePetCode(value);
    if (!id || id === 'me') {
      setStatus('error');
      setMessage(
        id === 'me'
          ? '这是你自己的演示碰爪码。试试朋友的码，或体验下方的扫码流程。'
          : '这不是可识别的碰爪伙伴码。请扫描朋友的碰爪码，不会打开其他链接。',
      );
      return;
    }
    setStatus('idle');
    resolved.current(id);
  }
  async function startCamera() {
    release();
    const token = generation.current;
    setStatus('requesting');
    setMessage('请允许使用摄像头，将碰爪码放进框内。');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const source = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (token !== generation.current) {
        source.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = source;
      if (!video.current) {
        release();
        return;
      }
      video.current.srcObject = source;
      await video.current.play();
      const { default: jsQR } = await import('jsqr');
      if (token !== generation.current) return;
      setStatus('scanning');
      setMessage('把碰爪码放进框内，识别后会打开宠物名片。');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('canvas unavailable');
      let last = 0;
      function scan(time: number) {
        if (token !== generation.current) return;
        const element = video.current;
        try {
          if (ctx && element && element.readyState >= 2 && time - last > 250) {
            last = time;
            const scale = Math.min(1, 720 / element.videoWidth);
            canvas.width = Math.max(1, Math.round(element.videoWidth * scale));
            canvas.height = Math.max(
              1,
              Math.round(element.videoHeight * scale),
            );
            ctx.drawImage(element, 0, 0, canvas.width, canvas.height);
            const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(pixels.data, pixels.width, pixels.height);
            if (code) {
              accept(code.data);
              return;
            }
          }
        } catch {
          release();
          setStatus('error');
          setMessage(
            '画面识别暂时中断，摄像头已关闭。请重试或从相册选择碰爪码。',
          );
          return;
        }
        frame.current = requestAnimationFrame(scan);
      }
      frame.current = requestAnimationFrame(scan);
    } catch (error) {
      if (token !== generation.current) return;
      release();
      setStatus('error');
      const name = error instanceof Error ? error.name : '';
      setMessage(
        name === 'NotAllowedError' || name === 'SecurityError'
          ? '未获得摄像头权限。可以在浏览器设置中允许，或从相册选择碰爪码。'
          : '暂时无法打开摄像头。请检查设备和权限，或选择相册里的碰爪码。',
      );
    }
  }
  async function readImage(file?: File) {
    if (!file) return;
    release();
    const token = generation.current;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setStatus('error');
      setMessage('请选择8 MB以内的 JPG、PNG 或 WebP 图片。');
      return;
    }
    setStatus('reading');
    setMessage('正在识别图片中的碰爪码…');
    const url = URL.createObjectURL(file);
    try {
      const picture = new Image();
      await new Promise<void>((resolve, reject) => {
        picture.onload = () => resolve();
        picture.onerror = reject;
        picture.src = url;
      });
      const { default: jsQR } = await import('jsqr');
      if (token !== generation.current) return;
      const scale = Math.min(1, 1600 / Math.max(picture.width, picture.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(picture.width * scale));
      canvas.height = Math.max(1, Math.round(picture.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');
      ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(pixels.data, pixels.width, pixels.height);
      if (code) accept(code.data);
      else {
        setStatus('error');
        setMessage('没有识别到二维码，请选一张清晰、完整的碰爪码图片。');
      }
    } catch {
      if (token === generation.current) {
        setStatus('error');
        setMessage('图片读取失败，请重新选择一张清晰的碰爪码图片。');
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return (
    <div className="pet-scanner">
      <div
        className={
          'scan-camera ' + (status === 'scanning' ? 'is-scanning' : '')
        }
      >
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          aria-label="扫一扫摄像头画面"
        />
        <div className="scan-frame">
          <span />
          <span />
          <span />
          <span />
          {status === 'scanning' && <i />}
        </div>
        {status !== 'scanning' && (
          <div className="scan-idle">
            <ScanLine size={42} />
            <strong>
              {status === 'reading' ? '正在识别' : '扫一扫，碰个爪'}
            </strong>
            <button
              onClick={startCamera}
              disabled={status === 'requesting' || status === 'reading'}
            >
              <Camera size={17} />
              {status === 'requesting' ? '等待摄像头授权…' : '开启摄像头'}
            </button>
          </div>
        )}
        {status === 'scanning' && (
          <button
            className="scan-stop"
            onClick={() => {
              release();
              setStatus('idle');
              setMessage('摄像头已关闭，可以重新开启或从相册选码。');
            }}
          >
            <X size={15} />
            关闭摄像头
          </button>
        )}
      </div>
      <output
        className={'scan-message ' + (status === 'error' ? 'scan-error' : '')}
      >
        {message}
      </output>
      <div className="scan-options">
        <button
          onClick={() => fileInput.current?.click()}
          disabled={status === 'reading'}
        >
          <ImagePlus size={24} />
          <span>相册识码</span>
        </button>
        {onMyCode && (
          <button onClick={onMyCode}>
            <QrCode size={24} />
            <span>我的碰爪码</span>
          </button>
        )}
      </div>
      <input
        ref={fileInput}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="选择碰爪码图片"
        onChange={(e) => {
          void readImage(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <div className="scan-consent">
        <ShieldCheck size={19} />
        <p>
          扫码只打开名片。成为好友、聊天和约遛，都需要双方同意。图片仅在本机识别。
        </p>
      </div>
      <button
        className="scan-demo-link"
        onClick={() => {
          release();
          resolved.current('tudou');
        }}
      >
        没有码？体验扫描土豆的演示码 →
      </button>
    </div>
  );
}
