import React from 'react';
import { BossRecord } from '../types';
import { formatHoursAndMinutes } from '../utils/formatTime';
import {
  Clock,
  RotateCcw,
  Volume2,
  Edit3,
  MapPin,
  Shield,
  Swords,
  Star,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface BossCardProps {
  boss: BossRecord;
  currentTime: Date;
  onQuickKill: (boss: BossRecord) => void;
  onCustomTime: (boss: BossRecord) => void;
  onResetTime: (boss: BossRecord) => void;
  onToggleFavorite: (boss: BossRecord) => void;
  onTestVoice: (boss: BossRecord) => void;
  onEditBoss?: (boss: BossRecord) => void;
  showServerBadge?: boolean;
}

export const BossCard: React.FC<BossCardProps> = ({
  boss,
  currentTime,
  onQuickKill,
  onCustomTime,
  onResetTime,
  onToggleFavorite,
  onTestVoice,
  onEditBoss,
  showServerBadge = true,
}) => {
  let status: 'unknown' | 'spawned' | 'soon' | 'cooldown' = 'unknown';
  let diffMs = 0;
  let countdownText = '--:--:--';
  let timePillText = '--:--';

  if (boss.nextSpawnAt) {
    const spawnDate = new Date(boss.nextSpawnAt);
    if (!isNaN(spawnDate.getTime())) {
      timePillText = spawnDate.toLocaleTimeString('th-TH', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
      });

      diffMs = spawnDate.getTime() - currentTime.getTime();

      if (diffMs <= 0) {
        status = 'spawned';
        const passedSec = Math.floor(Math.abs(diffMs) / 1000);
        const passedMin = Math.floor(passedSec / 60);
        const remSec = passedSec % 60;
        countdownText = `เกินมา ${passedMin}:${remSec.toString().padStart(2, '0')}`;
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        countdownText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        if (diffMs <= 15 * 60 * 1000) {
          status = 'soon';
        } else {
          status = 'cooldown';
        }
      }
    }
  }

  const isServer1 = boss.serverId === 'server_1';

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
        status === 'spawned'
          ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/30 via-[#0e1628] to-[#080d18] shadow-lg shadow-rose-950/20'
          : status === 'soon'
          ? 'border-amber-500/70 bg-gradient-to-b from-amber-950/25 via-[#0e1628] to-[#080d18] shadow-lg shadow-amber-950/20'
          : 'border-[#16233f] bg-[#0c1324] hover:border-[#213560]'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {boss.bossNumber && (
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0f2c4e] text-[#38bdf8] border border-[#0284c7]/40 shadow-sm">
                #{boss.bossNumber}
              </span>
            )}
            {showServerBadge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  isServer1
                    ? 'border-amber-500/70 text-amber-300 bg-amber-500/10'
                    : 'border-purple-500/70 text-purple-300 bg-purple-500/10'
                }`}
              >
                {isServer1 ? (
                  <Shield className="w-3 h-3 text-amber-400" />
                ) : (
                  <Swords className="w-3 h-3 text-purple-400" />
                )}
                <span>{boss.serverName}</span>
              </span>
            )}
            {boss.isCustom && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> กำหนดเอง
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(boss)}
            className="text-stone-600 hover:text-amber-400 transition-colors cursor-pointer p-0.5"
            title="เพิ่ม/ลบรายการโปรด"
          >
            <Star
              className={`w-4 h-4 ${
                boss.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-stone-600'
              }`}
            />
          </button>
        </div>

        {/* Boss Name */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">
          {boss.nameTh} {boss.nameEn ? `- ${boss.nameEn}` : ''}
        </h3>

        {/* Location & Cooldown */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 my-1 truncate">
          <MapPin className="w-3 h-3 text-stone-500 flex-shrink-0" />
          <span className="truncate">{boss.location || 'ตามแมพ / พื้นที่ล่า'}</span>
          <span>•</span>
          <span className="text-stone-300">
            รอบ {formatHoursAndMinutes(boss.cooldownHours)}
          </span>
          {boss.rebootHours != null && (
            <>
              <span>•</span>
              <span className="text-amber-400/90 font-mono">
                รีบูท {formatHoursAndMinutes(boss.rebootHours)}
              </span>
            </>
          )}
        </div>

        {/* Spawn Time Pill Display */}
        <div className="my-3 p-3 rounded-xl bg-[#070b14] border border-[#16223b] text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`font-mono font-bold text-xl ${
                status === 'spawned'
                  ? 'text-rose-400'
                  : status === 'soon'
                  ? 'text-amber-400'
                  : status === 'cooldown'
                  ? 'text-white'
                  : 'text-stone-500'
              }`}
            >
              {timePillText}
            </span>
            <Clock className="w-4 h-4 text-stone-400" />
            <span className="text-xs text-stone-400">น.</span>
            <button
              onClick={() => onResetTime(boss)}
              className="p-1 rounded-full text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
              title="รีเซ็ตเวลา"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-1 text-xs font-mono">
            {status === 'spawned' ? (
              <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {countdownText}
              </span>
            ) : status === 'unknown' ? (
              <span className="text-stone-600">นับถอยหลัง (--:--:--)</span>
            ) : (
              <span
                className={
                  status === 'soon' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                }
              >
                นับถอยหลัง ({countdownText})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 border-t border-[#16233f] flex items-center justify-between gap-2">
        <button
          onClick={() => onQuickKill(boss)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs shadow-md shadow-orange-950/40 transition-all cursor-pointer"
          title="อัปเดตเวลาบอสตายตอนนี้"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>อัปเดต</span>
        </button>

        <button
          onClick={() => onCustomTime(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-300 hover:text-white border border-[#21325c] transition-colors cursor-pointer"
          title="ระบุเวลาตายย้อนหลัง"
        >
          <Clock className="w-4 h-4" />
        </button>

        <button
          onClick={() => onTestVoice(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-400 hover:text-amber-400 border border-[#21325c] transition-colors cursor-pointer"
          title="ทดสอบเสียงอ่าน"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEditBoss?.(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-400 hover:text-sky-400 border border-[#21325c] transition-colors cursor-pointer"
          title="แก้ไขข้อมูลบอส"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
