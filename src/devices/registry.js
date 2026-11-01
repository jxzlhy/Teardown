/* 设备注册表（唯一事实源，数量以脚本输出为准）
   新增设备用 npm run add -- --id xxx ...（自动查重 + 生成模板 + 插入本文件）
   注意：本文件会被 Node 侧工具与 virtual:device-manifest 全量 import；
   浏览器端请用 virtual:device-loaders 按 id 动态加载，不要直接 import 本文件。 */
import action5pro from './action5pro.js';
import action4 from './action4.js';
import pocket3 from './pocket3.js';
import mini4pro from './mini4pro.js';
import avata2 from './avata2.js';
import mavic3pro from './mavic3pro.js';
import s25ultra from './s25-ultra.js';
import s25plus from './s25-plus.js';
import s25 from './s25.js';
import zfold7 from './zfold7.js';
import zflip7 from './zflip7.js';
import phone3 from './phone3.js';
import phone4apro from './phone4apro.js';
import phone3alite from './phone3alite.js';
import visionPro from './vision-pro.js';
import macStudio from './mac-studio.js';
import macMini from './mac-mini.js';
import macbookPro from './macbook-pro.js';
import imac from './imac.js';
import ipadPro from './ipad-pro.js';
import airpodsMax from './airpods-max.js';
import airpodsPro from './airpods-pro.js';
import watchUltra from './watch-ultra.js';
import switchOled from './switch-oled.js';
import switch2 from './switch2.js';
import iphoneAir from './iphone-air.js';
import iphone17 from './iphone-17.js';
import macbookAir from './macbook-air.js';
import ipadAir from './ipad-air.js';
import airpods5 from './airpods-5.js';
import studioDisplay from './studio-display.js';
import airtag from './airtag.js';
import flipperZero from './flipper-zero.js';
import frameworkLaptop13 from './framework-laptop13.js';
import iphone18ProMax from './iphone-18-pro-max.js';
import iphone18ProMaxBurgundy from './iphone-18-pro-max-burgundy.js';
import iphoneDuoFold from './iphone-duo-fold.js';
import iphone12Teardown from './iphone-12-teardown.js';
import iphone13 from './iphone-13.js';
import iphone16 from './iphone-16.js';
import galaxyS22Ultra from './galaxy-s22-ultra.js';
import modularSmartphone from './modular-smartphone.js';
import porsche911Carrera4s from './porsche-911-carrera-4s.js';
import v6Engine from './v6-engine.js';
import v8Engine from './v8-engine.js';
import combustionEngine from './combustion-engine.js';
import nikonD6 from './nikon-d6.js';
import nikonZ6 from './nikon-z6.js';
import countachLpi8004 from './countach-lpi800-4.js';
import porsche911930 from './porsche-911-930.js';
import jetEngine from './jet-engine.js';
import hydraulicJack from './hydraulic-jack.js';
import ak47 from './ak-47.js';
import waltherP99 from './walther-p99.js';
import m4Carbine from './m4-carbine.js';
import gl06Launcher from './gl-06-launcher.js';
import hubbleTelescope from './hubble-telescope.js';
import perseveranceRover from './perseverance-rover.js';
import insideDrone from './inside-drone.js';
import swissEscapement from './swiss-escapement.js';
import orrery from './orrery.js';
import santacruzV10 from './santacruz-v10.js';
import royalTypewriter from './royal-typewriter.js';
import eumigProjector from './eumig-projector.js';
import vcrHanseatic from './vcr-hanseatic.js';
import tr808 from './tr-808.js';
import cherryMxSwitch from './cherry-mx-switch.js';
import radioTransceiver from './radio-transceiver.js';
import drillPress from './drill-press.js';
import vintageMicroscope from './vintage-microscope.js';
import pocketWatch from './pocket-watch.js';
import portableCassettePlayer from './portable-cassette-player.js';
import retroMultimeter from './retro-multimeter.js';
import handDrill from './hand-drill.js';
import digitalWatch from './digital-watch.js';
import alarmClock from './alarm-clock.js';
import cashRegister from './cash-register.js';
import retroConsole from './retro-console.js';
import polaroidCoolcam from './polaroid-coolcam.js';
import casioVlTone from './casio-vl-tone.js';
import hypoidGear from './hypoid-gear.js';
import marshallJcm800 from './marshall-jcm800.js';
import computerParts from './computer-parts.js';
import sonyTc510 from './sony-tc510.js';
import filmstripProjector from './filmstrip-projector.js';
import wallClock from './wall-clock.js';
import planetaryGearbox from './planetary-gearbox.js';
import kitchenBlender from './kitchen-blender.js';
import angleGrinder from './angle-grinder.js';
import pinballMachine from './pinball-machine.js';
import tripleEngine from './triple-engine.js';
import gramophone from './gramophone.js';
import smegToaster from './smeg-toaster.js';
import tourbillonMovement from './tourbillon-movement.js';
import grandPiano from './grand-piano.js';
import gameboy from './gameboy.js';
import doorLockMechanism from './door-lock-mechanism.js';
import retroFan from './retro-fan.js';
import fenderStratocaster from './fender-stratocaster.js';
import commodore64 from './commodore-64.js';
import admiral7t10 from './admiral-7t10.js';
import we500RotaryPhone from './we500-rotary-phone.js';
import regencyTr1 from './regency-tr1.js';
import radialEngine from './radial-engine.js';

export const devices = [
  /* DJI */
  action5pro, action4, pocket3, mini4pro, avata2, mavic3pro,
  /* Samsung */
  s25ultra, s25plus, s25, zfold7, zflip7, galaxyS22Ultra,
  /* Nothing */
  phone3, phone4apro, phone3alite,
  /* Apple */
  visionPro, macStudio, macMini, macbookPro, imac, ipadPro, airpodsMax, airpodsPro, watchUltra,
  iphoneAir, iphone17, macbookAir, ipadAir, airpods5, studioDisplay, airtag,
  iphone18ProMax, iphone18ProMaxBurgundy, iphoneDuoFold, iphone12Teardown, iphone13, iphone16,
  /* 相机 · 其他品牌 */
  nikonD6, nikonZ6,
  /* 汽车 · 机械 */
  porsche911Carrera4s, countachLpi8004, porsche911930,
  v6Engine, v8Engine, combustionEngine, jetEngine, hydraulicJack,
  /* 枪械（博物馆式结构教育） */
  ak47, waltherP99, m4Carbine, gl06Launcher,
  /* 航天 · 无人机 */
  hubbleTelescope, perseveranceRover, insideDrone,
  /* 其他 */
  switchOled, switch2, flipperZero, frameworkLaptop13, modularSmartphone,
  /* GENERIC */
  swissEscapement, orrery, radioTransceiver, drillPress, vintageMicroscope, pocketWatch, portableCassettePlayer, retroMultimeter, handDrill, digitalWatch, alarmClock, cashRegister, retroConsole, hypoidGear, computerParts, filmstripProjector, wallClock, planetaryGearbox, kitchenBlender, pinballMachine, tripleEngine, gramophone, grandPiano, radialEngine,
  /* SANTA CRUZ */
  santacruzV10,
  /* ROYAL */
  royalTypewriter,
  /* EUMIG */
  eumigProjector,
  /* HANSEATIC */
  vcrHanseatic,
  /* ROLAND */
  tr808,
  /* CHERRY */
  cherryMxSwitch,
  /* POLAROID */
  polaroidCoolcam,
  /* CASIO */
  casioVlTone,
  /* MARSHALL */
  marshallJcm800,
  /* SONY */
  sonyTc510,
  /* DEWALT */
  angleGrinder,
  /* SMEG */
  smegToaster,
  /* LAIMER */
  tourbillonMovement,
  /* NINTENDO */
  gameboy,
  /* REANIMATE */
  doorLockMechanism,
  /* DYLANHEYES */
  retroFan,
  /* FENDER */
  fenderStratocaster,
  /* COMMODORE */
  commodore64,
  /* ADMIRAL */
  admiral7t10,
  /* WESTERN */
  we500RotaryPhone,
  /* REGENCY */
  regencyTr1,
];
export const getDevice = id => devices.find(d => d.id === id);
export const brands = [...new Set(devices.map(d => d.brand || 'OTHER'))];
export const categories = [...new Set(devices.map(d => d.category))];
