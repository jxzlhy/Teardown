<template>
  <div class="viewer" :class="{ immersive: immersiveMode, thumb: thumbMode, 'rail-open': railOpen, 'mp': isMobile, 'has-sheet': !!selectedPart && isMobile, 'clip-on': ui.viewMode === 'clip', 'has-vstrip': viewStripOpen }" :style="{ '--sheet-h': sheetH + 'px' }">
    <canvas id="scene" ref="canvasRef" @pointerdown="viewPreset = null"></canvas>
    <div id="labels" ref="labelsRef"></div>
    <div id="fx-scan"></div>
    <div v-if="bootScanRun" id="bootScan" class="hud-scan once"></div>

    <!-- 开场大字（boot 演出专用，结束移除） -->
    <div v-if="bootTitleShow" id="bootTitle">
      <span class="bt-en">{{ device.en }}</span>
      <span class="bt-zh">{{ device.name }}</span>
    </div>

    <!-- 顶部细导航条 -->
    <header v-if="!thumbMode" id="topbar" class="hud-panel hud-corner">
      <router-link class="tb-back" to="/" aria-label="返回门厅">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
      </router-link>
      <div class="tb-name">
        <span class="tb-model">{{ device.en }}</span>
        <h1>{{ device.name }}</h1>
      </div>
      <span class="tb-status" :title="ui.modelStatus">
        <i class="hud-dot" :class="statusTone"></i><em>{{ statusShort }}</em>
      </span>
      <button class="hud-icon" :class="{ on: infoOpen }" @click="infoOpen = !infoOpen" aria-label="设备总览">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v6"/></svg>
        <span class="tip tip-below">总览</span>
      </button>
    </header>

    <!-- 左侧部件清单：可折叠 rail（两种导航模式：清单列表 / 宫格面板，V2） -->
    <aside v-if="!thumbMode" id="rail" class="hud-panel" :class="{ open: railOpen }">
      <div class="rail-head">
        <button class="rail-toggle" @click="toggleRail" :aria-expanded="railOpen ? 'true' : 'false'" title="展开 / 收起部件导航（紧凑 ↔ 展开）">
          <span class="hud-eyebrow">部件清单 · {{ device.parts.length }}</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <button class="rail-mode" @click="toggleRailMode" :title="railMode === 'list' ? '切换宫格导航' : '切换清单导航'" :aria-label="railMode === 'list' ? '切换宫格导航' : '切换清单导航'">
          <svg v-if="railMode === 'list'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/>
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <div class="rail-list" v-if="railMode === 'list'">
        <button v-for="(p, i) in device.parts" :key="p.id"
          class="prow" :class="{ active: ui.selected === p.id }"
          @click="pickFromList(p.id)"
          @pointerenter="engine && engine.setHover(p.id)"
          @pointerleave="engine && engine.setHover(null)">
          <span class="idx">{{ String(i+1).padStart(2,'0') }}</span>
          <span class="pname">{{ p.zh }}</span>
          <span class="pen">{{ p.en.split(' ')[0] }}</span>
        </button>
      </div>
      <div class="rail-grid" v-else>
        <button v-for="(p, i) in device.parts" :key="p.id"
          class="gcell" :class="{ active: ui.selected === p.id }"
          @click="pickFromList(p.id)"
          @pointerenter="engine && engine.setHover(p.id)"
          @pointerleave="engine && engine.setHover(null)">
          <b>{{ String(i+1).padStart(2,'0') }}</b>
          <span>{{ p.zh }}</span>
        </button>
      </div>
    </aside>
    <!-- 折叠态：序号圆点列（hover 展开名称） -->
    <div v-if="!thumbMode" id="railDots" v-show="!railOpen">
      <button v-for="(p, i) in device.parts" :key="p.id" class="rdot"
        :class="{ active: ui.selected === p.id, hot: ui.selected === p.id }"
        :data-name="`${String(i+1).padStart(2,'0')} ${p.zh}`"
        @click="pickFromList(p.id)"
        @pointerenter="engine && engine.setHover(p.id)"
        @pointerleave="engine && engine.setHover(null)">
        <i></i><b>{{ String(i+1).padStart(2,'0') }}</b>
      </button>
    </div>

    <!-- 移动端：部件横滑 chips -->
    <div v-if="!thumbMode" id="mpChips">
      <button v-for="(p, i) in device.parts" :key="p.id" class="hud-chip"
        :class="{ on: ui.selected === p.id }"
        @click="pickFromList(p.id)">
        {{ String(i+1).padStart(2,'0') }} {{ p.zh }}
      </button>
    </div>

    <!-- 上下文详情卡：仅选中部件时滑入（移动端变底部 sheet） -->
    <Transition name="ctx">
      <aside v-if="selectedPart && !thumbMode" id="ctxCard" ref="sheetEl" class="hud-panel hud-corner" :key="selectedPart.id">
        <div class="sheet-grip" @click="closeDetail"><i></i></div>
        <div class="hud-eyebrow ctx-eyebrow">展签 SPECIMEN · {{ String(partIndex+1).padStart(2,'0') }} / {{ device.parts.length }}</div>
        <div class="ctx-thumb-wrap">
          <img v-if="partThumb" class="ctx-thumb" :src="partThumb" alt="" aria-hidden="true">
        </div>
        <h2>{{ selectedPart.zh }}<small>{{ selectedPart.en }}</small></h2>
        <div class="ctx-tag">{{ selectedPart.tag }}</div>
        <div class="ctx-desc">{{ selectedPart.desc }}</div>
        <div class="ctx-tech" v-if="partTech">
          <button class="tech-head" @click="techOpen = !techOpen" :aria-expanded="techOpen ? 'true' : 'false'">
            <span class="hud-eyebrow">原理 · {{ partTech.zh }}</span>
            <svg class="chev" :class="{ up: techOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <div v-show="techOpen" class="tech-body">
            <p v-if="partTech.principle">{{ partTech.principle }}</p>
            <p v-else class="tech-todo">原理编写中 · 本条仅登记关联，不臆造内容</p>
            <div v-if="partTech.invented" class="tech-meta">起始 · {{ partTech.invented }}</div>
            <div v-if="partTech.history && partTech.history.length" class="tech-hist">
              <div v-for="([y, txt], i) in partTech.history" :key="i" class="tech-hrow">
                <span class="hy">{{ y }}</span><span class="ht">{{ txt }}</span>
              </div>
            </div>
            <div v-if="partTech.sources && partTech.sources.length" class="tech-src">
              <a v-for="s in partTech.sources" :key="s.url" :href="s.url" target="_blank" rel="noopener">{{ s.label }} ↗</a>
            </div>
          </div>
        </div>
        <div class="spec-list">
          <div v-for="([k, v], i) in selectedPart.specs" :key="i" class="spec">
            <span class="k">{{ k }}</span><span class="v">{{ v }}</span>
          </div>
        </div>
        <div class="ctx-actions">
          <button class="hud-glow-btn primary" @click="engine && engine.flyToPart(selectedPart.id)">聚焦 <kbd>F</kbd></button>
          <button class="hud-glow-btn" @click="closeDetail">关闭 <kbd>Esc</kbd></button>
        </div>
      </aside>
    </Transition>

    <!-- 底部图标 dock（点击任意工具时收起二级菜单条——V2 第四章 4.2 统一菜单管理） -->
    <div v-if="!thumbMode" id="dock" class="hud-panel" @click.capture="onDockClick">
      <div class="dock-group">
        <button class="hud-glow-btn primary dock-explode" id="btnExplode"
          @click="toggleExplode"
          @pointerdown="lpStart" @pointerup="lpEnd" @pointerleave="lpEnd" @pointercancel="lpEnd">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M18.4 5.6l-4.2 4.2M9.8 14.2l-4.2 4.2"/>
          </svg>{{ explodePct > 50 ? '组装' : '拆解' }}
        </button>
        <div id="exWrap" v-if="!ui.step">
          <input type="range" id="exSlider" min="0" max="1000" :value="sliderValue"
            :style="{ '--p': explodePct + '%' }"
            @pointerdown="scrubbing = true" @pointerup="scrubbing = false"
            @input="onSliderInput" ref="sliderRef" aria-label="拆解度">
        </div>
        <div id="exWrap" class="step-ctl" v-else>
          <button class="step-btn" @click="engine && engine.stepPrev()" :disabled="ui.step.i <= 0" aria-label="上一步">‹</button>
          <span class="step-count">装配 {{ ui.step.i }}/{{ ui.step.n }}</span>
          <button class="step-btn" @click="engine && engine.stepNext()" :disabled="ui.step.i >= ui.step.n" aria-label="下一步">›</button>
        </div>
      </div>
      <div class="tb-sep"></div>
      <div class="dock-group">
        <span class="dock-glabel" aria-hidden="true">视图</span>
        <button class="hud-icon" :class="{ on: !ui.viewMode }" @click="engine && engine.setMode(null)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2zM12 11L4 6.5M12 11l8-4.5M12 11v9"/></svg>
          <span class="tip">整机 <kbd>1</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.viewMode === 'xray' }" @click="setViewMode('xray')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18M12 5v14" stroke-dasharray="2.5 2.5"/></svg>
          <span class="tip">X 光 <kbd>2</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.viewMode === 'isolate' }" @click="setViewMode('isolate')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
          <span class="tip">隔离 <kbd>3</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.viewMode === 'clip' }" @click="setViewMode('clip')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18L18 4M4 18h14V4" /><path d="M2 9l9 9" stroke-dasharray="2.5 2.5"/></svg>
          <span class="tip">剖切 <kbd>4</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.tool === 'measure' }" @click="toggleMeasure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="9" width="19" height="6.5" rx="1.5"/><path d="M7 9v3.5M11 9v2.5M15 9v3.5M19 9v2.5"/></svg>
          <span class="tip">测量 <kbd>M</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: !!ui.step }" @click="toggleStep">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 17h4v4H4zM10 12h4v9h-4zM16 7h4v14h-4z" stroke-dasharray="0"/><path d="M3 20L20 3" stroke-dasharray="2.5 2.5"/></svg>
          <span class="tip">逐步装配 <kbd>B</kbd></span>
        </button>
      </div>
      <div class="tb-sep"></div>
      <div class="dock-group">
        <button class="hud-icon" :class="{ on: viewStripOpen }" @click="viewStripOpen = !viewStripOpen" aria-label="视角预设">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke-dasharray="2.5 2.5"/></svg>
          <span class="tip">视角 <kbd>V</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: hall === 'day' }" @click="toggleHall" aria-label="白天/黑夜双厅">
          <svg v-if="hall === 'day'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1L19 19M19 5l-1.9 1.9M6.9 17.1L5 19"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.5 14.5A8.5 8.5 0 019.5 3.5a8.5 8.5 0 1011 11z"/></svg>
          <span class="tip">{{ hall === 'day' ? '夜厅' : '日厅' }} <kbd>N</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.labelsMode && ui.labelsMode !== 'off' }" @click="cycleLabels">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/><path d="M9 12h6"/></svg>
          <span class="tip">标签 {{ labelsName }} <kbd>L</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: ui.autoRotate }" @click="engine && engine.setAutoRotate(!ui.autoRotate)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4"/></svg>
          <span class="tip">自动旋转</span>
        </button>
        <button class="hud-icon" @click="shoot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/></svg>
          <span class="tip">截图 <kbd>S</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: tour }" @click="toggleTour">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 4.5l13 7.5-13 7.5v-15z"/></svg>
          <span class="tip">自动导览 <kbd>T</kbd></span>
        </button>
        <button class="hud-icon" :class="{ on: immersiveMode }" @click="toggleImmersive">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
          <span class="tip">沉浸 <kbd>H</kbd></span>
        </button>
        <button class="hud-icon" @click="showGuide = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.6 2.4c-.9.4-1.2 1-1.2 1.9M12 16.6h.01"/></svg>
          <span class="tip">帮助 <kbd>?</kbd></span>
        </button>
      </div>
      <div class="tb-sep tb-sep-nav"></div>
      <div class="dock-group dock-nav">
        <button class="hud-icon nav" @click="goDevice(prevDevice)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg><span class="tip">{{ prevDevice.name }}</span></button>
        <button class="hud-icon nav" @click="goDevice(nextDevice)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg><span class="tip">{{ nextDevice.name }}</span></button>
      </div>
    </div>

    <!-- 剖切高度滑杆（剖切模式激活时出现；浮层栈位由 floatSlots 统一协调） -->
    <div v-if="!thumbMode && ui.viewMode === 'clip'" id="clipStrip" class="hud-panel" :style="{ bottom: floatY(floatSlots.clip) }">
      <label>切面高度</label>
      <input type="range" min="0" max="1000" :value="Math.round((ui.clipT ?? .62) * 1000)"
        :style="{ '--p': Math.round((ui.clipT ?? .62) * 100) + '%' }"
        @input="onClipInput" aria-label="切面高度">
    </div>

    <!-- 视角预设条（dock 视角键 / V 键切换） -->
    <div v-if="!thumbMode && viewStripOpen" id="viewStrip" class="hud-panel" :style="{ bottom: floatY(floatSlots.views) }">
      <button class="hud-chip" :class="{ on: viewPreset === 'front' }" @click="flyView('front')">正面 <kbd>5</kbd></button>
      <button class="hud-chip" :class="{ on: viewPreset === 'back' }" @click="flyView('back')">背面 <kbd>6</kbd></button>
      <button class="hud-chip" :class="{ on: viewPreset === 'left' }" @click="flyView('left')">左侧 <kbd>7</kbd></button>
      <button class="hud-chip" :class="{ on: viewPreset === 'right' }" @click="flyView('right')">右侧 <kbd>8</kbd></button>
      <button class="hud-chip" :class="{ on: viewPreset === 'interior' }" @click="flyView('interior')">内部 <kbd>9</kbd></button>
      <button class="hud-chip" @click="resetCam">复位 <kbd>R</kbd></button>
    </div>

    <!-- 自动导览进度条 -->
    <div v-if="!thumbMode && tour" id="tourBar" class="hud-panel" :style="{ bottom: floatY(floatSlots.tour) }">
      <span class="hud-eyebrow">TOUR · {{ tour.mode === 'manual' ? '手动' : '连播' }}</span>
      <div class="tour-dots">
        <i v-for="(id, i) in tour.total" :key="i" :class="{ cur: i === tour.i, done: i < tour.i }"></i>
      </div>
      <button class="hud-icon" @click="engine && engine.setTourMode(tour.mode === 'manual' ? 'auto' : 'manual')" :title="tour.mode === 'manual' ? '切到连播（自动前进）' : '切到手动（‹ › 自主前进）'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path v-if="tour.mode === 'manual'" d="M5 3l4 4M3 7h6M19 3l-4 4M21 7h-6M8 21v-7a4 4 0 018 0v7M12 14v7"/>
          <path v-else d="M6 4v16M18 4v16M6 12h12M9 8l-3 4 3 4M15 8l3 4-3 4"/>
        </svg>
      </button>
      <button class="hud-icon" @click="engine && engine.tourPrev()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="hud-icon" @click="engine && engine.tourNext()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button>
      <button class="hud-glow-btn" @click="engine && engine.stopTour()">停止</button>
    </div>
    <!-- 讲解卡：策展讲解词 + 可选 Web Speech 朗读（默认关） -->
    <Transition name="fade">
      <div v-if="!thumbMode && tour && tour.note" id="tourNote" class="hud-panel" :style="{ bottom: floatY(floatSlots.note) }">
        <p class="tour-note-text">{{ tour.note }}</p>
        <button class="hud-icon tts-btn" :class="{ on: ttsOn }" @click="toggleTts" :title="ttsOn ? '停止朗读' : '朗读讲解'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path v-if="!ttsOn" d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/><path v-else d="M17 9l6 6M23 9l-6 6"/></svg>
        </button>
      </div>
    </Transition>

    <!-- ⓘ 设备总览弹卡 -->
    <Transition name="fade">
      <div v-if="infoOpen && !thumbMode" id="infoPop" class="hud-panel hud-corner">
        <div class="hud-eyebrow">{{ device.en }} · OVERVIEW</div>
        <h3>{{ device.category }} · {{ device.name }}</h3>
        <div class="ctx-desc">{{ device.description }}</div>
        <div class="spec-list">
          <div v-if="device.era != null && !(device.specs || []).some(([k]) => k === '发布')" class="spec"><span class="k">发布</span><span class="v">{{ device.era }}</span></div>
          <div v-for="([k, v], i) in device.specs" :key="i" class="spec">
            <span class="k">{{ k }}</span><span class="v">{{ v }}</span>
          </div>
        </div>
        <div class="info-status">
          <span><i class="hud-dot" :class="statusTone"></i>{{ ui.modelStatus }}</span>
          <span>RENDER · {{ qualityLabel }}</span>
          <span>LAYOUT · {{ ui.layout === 'radial' ? 'RADIAL' : 'AXIS' }}</span>
        </div>
        <!-- 我的评分（V2 第七章）：总体常显 + 展开式六维细分 + 个人备注，纯本地 -->
        <div class="rate-box">
          <div class="rate-row">
            <span class="rate-k">总体</span>
            <span class="rate-stars" role="group" aria-label="总体">
              <button v-for="i in 5" :key="i" class="star" :class="{ on: i <= (myRating.overall || 0) }"
                @click="setMyRating('overall', i)" :aria-label="`总体 ${i} 星`">★</button>
            </span>
            <button class="rate-expand" @click="rateExpanded = !rateExpanded" :aria-expanded="rateExpanded ? 'true' : 'false'">
              细分评价 {{ rateExpanded ? '▴' : '▾' }}
            </button>
          </div>
          <div class="rate-detail" v-show="rateExpanded">
            <div class="rate-row" v-for="dim in RATE_DIMS" :key="dim.key">
              <span class="rate-k">{{ dim.zh }}</span>
              <span class="rate-stars" role="group" :aria-label="dim.zh">
                <button v-for="i in 5" :key="i" class="star sm" :class="{ on: i <= (myRating[dim.key] || 0) }"
                  @click="setMyRating(dim.key, i)" :aria-label="`${dim.zh} ${i} 星`">★</button>
              </span>
            </div>
            <textarea class="rate-note" v-model="myNote" @change="saveMyNote" @blur="saveMyNote"
              rows="2" maxlength="300" placeholder="个人备注：还原度、零件细节、值得研究之处…" aria-label="个人备注"></textarea>
            <button class="rate-clear" v-if="hasMyRating" @click="clearMyRating">清除我的评分</button>
          </div>
        </div>
        <div class="d-tip" v-if="device.modelCredit">
          MODEL CREDIT · {{ device.modelCredit }}
          <i v-if="creditUnverified" class="credit-flag" title="仅标注社区来源，作者与许可证尚未核实">来源待核实</i>
          <i v-if="licenseFlag" class="credit-flag warn" :title="licenseFlag.full">{{ licenseFlag.short }}</i>
          <a v-if="device.modelSource" class="credit-link" :href="device.modelSource" target="_blank" rel="noopener noreferrer">模型主页 ↗</a>
        </div>
        <div class="d-tip">{{ device.glb ? (device.source || '官方实机模型') : '程序化建模' }} · {{ device.parts.length }} 组核心部件</div>
        <div class="info-actions-row">
          <button v-if="compareGroup" class="hud-glow-btn cmp-entry" @click="router.push('/compare/' + compareGroup.id + '?focus=' + device.id)">
            代际对比 · {{ compareGroup.zh }}（{{ compareGroup.ids.length }} 型）↗
          </button>
          <button class="hud-glow-btn" :class="{ 'fav-on': deviceFav }" @click="toggleFav(device.id)">
            {{ deviceFav ? '★ 已收藏' : '☆ 收藏' }}
          </button>
        </div>
        <!-- 收藏馆管理（V2 第六章）：分类标签 + 个人备注（收藏后可用） -->
        <div class="fav-manage" v-if="deviceFav">
          <div class="fav-cats">
            <button v-for="cat in favCats" :key="cat" class="fav-cat" :class="{ on: deviceCats.includes(cat) }"
              @click="toggleDeviceCat(cat)">{{ cat }}</button>
          </div>
          <div class="fav-newcat">
            <input v-model="newCatName" @keydown.enter="addDeviceCat" maxlength="12"
              placeholder="新建分类…" aria-label="新建分类">
            <button @click="addDeviceCat" aria-label="添加分类">＋</button>
          </div>
          <textarea class="fav-note" v-model="deviceNote" @change="saveDeviceNote" @blur="saveDeviceNote"
            rows="2" maxlength="200" placeholder="收藏备注（仅本机可见）…" aria-label="收藏备注"></textarea>
          <div class="fav-at" v-if="favAt">收藏于 {{ new Date(favAt).toLocaleDateString() }}</div>
        </div>
        <button class="hud-glow-btn primary info-close" @click="infoOpen = false">关闭</button>
      </div>
    </Transition>

    <!-- 坐标辅助装置（V2 重设计）：方位陀螺 gizmo + 网格开关 -->
    <div v-if="!thumbMode" id="coordAid">
      <canvas id="gizmo" ref="gizmoRef" width="128" height="128" @click="viewStripOpen = !viewStripOpen" title="视角方位 · 点击展开视角条" aria-label="视角方位罗盘"></canvas>
      <button id="gridToggle" class="hud-icon" :class="{ on: gridOn }" @click="toggleGrid" aria-label="网格显隐">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="16.5" rx="9" ry="3.6"/><ellipse cx="12" cy="16.5" rx="4.5" ry="1.8"/><path d="M12 12.9v7.2M3 16.5h18"/></svg>
      </button>
    </div>

    <!-- 开场提示 toast（也被临时消息复用） -->
    <div v-if="!thumbMode" id="toast" :class="{ show: toastShow }" :style="{ bottom: floatY(floatSlots.toast) }">{{ toastMsg }}</div>

    <!-- 沉浸模式下的浮动恢复按钮 -->
    <button v-if="!thumbMode" id="immersiveExit" class="hud-glow-btn" @click="toggleImmersive">退出沉浸 · H</button>

    <div class="overlay" :class="{ hide: !showGuide }">
      <div id="guideCard" class="hud-panel hud-corner">
        <div class="hud-eyebrow">QUICK GUIDE</div>
        <h3>操作引导</h3>
        <div class="g-cols">
          <div class="g-col">
            <div class="g-row"><span class="g-key">拖拽 / 滚轮</span><span>旋转 · 缩放 · 右键平移</span></div>
            <div class="g-row"><span class="g-key">点击部件</span><span>镜头飞近 + 详情卡</span></div>
            <div class="g-row"><span class="g-key">SPACE</span><span>一键拆解 / 组装</span></div>
            <div class="g-row"><span class="g-key">1 - 4</span><span>整机 / X光 / 隔离 / 剖切</span></div>
            <div class="g-row"><span class="g-key">5 - 8</span><span>机位 正面 / 背面 / 左 / 右</span></div>
            <div class="g-row"><span class="g-key">9</span><span>内部视角（联动 X 光）</span></div>
            <div class="g-row"><span class="g-key">F</span><span>聚焦选中部件</span></div>
            <div class="g-row"><span class="g-key">M</span><span>两点测量（点模型表面）</span></div>
            <div class="g-row"><span class="g-key">B</span><span>逐步装配（‹ › 逐组拆装）</span></div>
          </div>
          <div class="g-col">
            <div class="g-row"><span class="g-key">T</span><span>自动导览（逐部件讲解）</span></div>
            <div class="g-row"><span class="g-key">S</span><span>截图保存 PNG</span></div>
            <div class="g-row"><span class="g-key">L</span><span>标签 自动/全部/关闭</span></div>
            <div class="g-row"><span class="g-key">N</span><span>日厅 / 夜厅切换</span></div>
            <div class="g-row"><span class="g-key">H</span><span>沉浸模式</span></div>
            <div class="g-row"><span class="g-key">← →</span><span>切换设备（导览时步进）</span></div>
          </div>
        </div>
        <button id="btnStart" @click="startExperience">开始拆解体验</button>
      </div>
    </div>

    <div v-if="!thumbMode" id="loader" :class="{ hide: ui.booted }">
      <div class="ring"></div>
      <div id="loadMsg">{{ loadStage }}</div>
      <div class="load-bar"><i :style="{ width: loadPct + '%' }"></i></div>
      <div id="loadSub">{{ loadStageSub }}</div>
    </div>

    <!-- 配置 chunk 拉取失败（发版后旧 chunk 404 等）：给出可见恢复路径 -->
    <div v-if="loadFailed && !thumbMode" id="loadErr" role="alert">
      <div class="hud-panel hud-corner">
        <div class="hud-eyebrow">LOAD ERROR</div>
        <p class="le-msg">设备配置加载失败，可能是页面版本已更新。</p>
        <div class="le-actions">
          <button class="hud-glow-btn primary" @click="reloadPage">重新加载</button>
          <button class="hud-glow-btn" @click="router.push('/')">返回门厅</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import gsap from 'gsap';
import { createEngine } from '../engine/engine.js?v=30';
import { getRating, setRating, clearRating, subscribeRatings } from '../lib/ratings.js';
import { techForPart } from '../knowledge/index.js';
import { groupOf as compareGroupOf } from '../knowledge/comparisons.js';
import { markExplored, isFavorite, toggleFavorite as toggleFavStore, getFavMetaOf, getFavMeta, toggleFavCat as toggleFavCatStore, setFavNote as setFavNoteStore, getCats, addCat as addCatStore } from '../lib/explore.js';
/* 元数据来自构建期清单，完整配置按 id 动态加载：进任意设备只解析这一台 */
import manifest from 'virtual:device-manifest';
import { loaders } from 'virtual:device-loaders';

const route = useRoute();
const router = useRouter();
const canvasRef = ref(null), labelsRef = ref(null), sliderRef = ref(null), sheetEl = ref(null);
const sheetH = ref(0);
let sheetRO = null;

let engine = null;
const ui = ref({
  explode: 0, explodeTarget: 0, selected: null, modelStatus: '',
  labelsOn: true, labelsMode: 'auto', autoRotate: false,
  viewMode: null, isolateId: null, clipT: 0.62, layout: 'axis', tool: null,
  tour: null, booted: false, quality: 2, step: null
});
const scrubbing = ref(false);
const showGuide = ref(false);
const immersiveMode = ref(false);
const infoOpen = ref(false);
const viewStripOpen = ref(false);
const viewPreset = ref(null);   // 当前机位（front/back/left/right/null=自由视角）
function onDockClick(e){
  /* V2 4.2：点击视角键以外的 dock 工具 → 收起二级菜单条（避免菜单无序滞留） */
  const btn = e.target.closest('button');
  if(btn && btn.closest('.dock-group') && !btn.getAttribute('aria-label')?.includes('视角') && !btn.classList.contains('dock-explode')){
    viewStripOpen.value = false;
  }
}
/* ---------- 浮层栈（V2 遮挡矩阵）：clipStrip/tourBar/viewStrip/tourNote/toast
   五层共存时的纵向位次集中于此计算——先入层在下，toast 恒在顶；移动端再让位详情 sheet ---------- */
const floatSlots = computed(() => {
  const slots = { clip: 0, tour: 0, views: 0, note: 0, toast: 0 };
  let n = 0;
  if (ui.value.viewMode === 'clip') slots.clip = n++;
  if (ui.value.tour) slots.tour = n++;
  if (viewStripOpen.value) slots.views = n++;
  slots.note = n;
  slots.toast = n + (ui.value.tour ? 1 : 0);   // 讲解卡比条高，toast 再上一层
  return slots;
});
const floatY = (slot) => {
  const base = isMobile.value ? 66 : 86;
  const lift = isMobile.value && sheetH.value ? sheetH.value + 20 : 0;   // 移动端详情 sheet 让位（原 has-sheet 机制收编）
  return (base + slot * 46 + lift) + 'px';
};
/* ---------- 白天/黑夜双厅（V2）：引擎光照 + 全站 CSS 主题 + localStorage 记忆 ---------- */
/* ---------- 我的评分（V2）：五星总体 + 多维评价（纯本地 dtm.ratings） ---------- */
/* ---------- 白天/黑夜双厅（V2 位置保留）：引擎光照 + 全站 CSS 主题 + localStorage 记忆 ---------- */
const hall = ref((() => { try{ return localStorage.getItem('dtm.hall') === 'day' ? 'day' : 'night'; }catch{ return 'night'; } })());
function applyHall(mode){
  document.documentElement.dataset.hall = mode;
  try{ localStorage.setItem('dtm.hall', mode); }catch{}
  engine && engine.setHallMode(mode);
}
function toggleHall(){ hall.value = hall.value === 'day' ? 'night' : 'day'; applyHall(hall.value); showToast(hall.value === 'day' ? '日厅 · 明亮展厅' : '夜厅 · 深空展厅', 1400); }
/* ---------- 坐标辅助装置（V2）：方位陀螺 gizmo + 网格开关 ----------
   gizmo 每帧读相机朝向画罗盘（指针=观察方位角，扇区标注当前机位名）；
   点击 gizmo 联动视角条。rAF 循环随组件卸载停止。 */
const gizmoRef = ref(null);
const gridOn = ref(true);
function toggleGrid(){
  gridOn.value = !gridOn.value;
  engine && engine.setGridVisible(gridOn.value);
  showToast(gridOn.value ? '网格显示' : '网格隐藏', 1000);
}
let gizmoRaf = 0;
function drawGizmo(){
  if(gizmoRef.value && engine && engine.getCamera){
    const g = gizmoRef.value.getContext('2d');
    const S = 128, C = S / 2;
    g.clearRect(0, 0, S, S);
    const dir = engine.getViewDir();
    const heading = Math.atan2(dir.x, -dir.z);          // 0=正面(+Z 机位) 顺时针为右
    const pitch = Math.asin(Math.max(-1, Math.min(1, -dir.y)));
    const hdeg = ((heading * 180 / Math.PI) % 360 + 360) % 360;
    /* 表盘 */
    g.beginPath(); g.arc(C, C, 54, 0, Math.PI * 2);
    g.fillStyle = 'rgba(4,10,16,.55)'; g.fill();
    g.strokeStyle = 'rgba(120,150,180,.4)'; g.lineWidth = 1; g.stroke();
    /* 方位刻度：前 0 / 右 90 / 后 180 / 左 270（角距 <45° 高亮） */
    g.font = '10px ui-monospace, Menlo, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const marks = [['前', 0], ['右', 90], ['后', 180], ['左', 270]];
    for(const [label, deg] of marks){
      const a = (deg - 90) * Math.PI / 180;
      const dist = Math.min(Math.abs(hdeg - deg), 360 - Math.abs(hdeg - deg));
      const tx = C + Math.cos(a) * 42, ty = C + Math.sin(a) * 42;
      g.fillStyle = dist < 45 ? '#45e0ff' : 'rgba(160,180,200,.6)';
      g.fillText(label, tx, ty);
    }
    /* 指针（观察方位角） */
    g.save();
    g.translate(C, C);
    g.rotate(heading);
    g.fillStyle = '#45e0ff';
    g.beginPath(); g.moveTo(0, -34); g.lineTo(5, 6); g.lineTo(0, 2); g.lineTo(-5, 6); g.closePath(); g.fill();
    g.restore();
    /* 俯仰读数 */
    g.fillStyle = 'rgba(200,220,235,.85)';
    g.fillText(`${Math.round(pitch * 180 / Math.PI)}°`, C, C + 22);
  }
  gizmoRaf = requestAnimationFrame(drawGizmo);
}
function flyView(preset){
  if(engine && engine.flyToView(preset)){
    const prev = viewPreset.value;
    viewPreset.value = preset;
    /* 内部视角联动 X-Ray（V2 第四章 4.3）：切进去开 X 光，切出来关 */
    if(preset === 'interior' && prev !== 'interior'){
      engine.setMode('xray');
    }else if(prev === 'interior' && preset !== 'interior'){
      engine.setMode(null);
    }
    showToast({ front: '正面机位', back: '背面机位', left: '左侧机位', right: '右侧机位',
      interior: '内部视角 · X 光' }[preset] || '', 1400);
  }
}
function resetCam(){
  engine && engine.resetView();
  viewPreset.value = null;
  if(ui.value.viewMode === 'xray') engine.setMode(null);
  showToast('视角复位', 1200);
}
const railOpen = ref(true);
const isMobile = ref(false);
const mobileMq = window.matchMedia('(max-width: 700px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function onMobileMq(e){ isMobile.value = e.matches; }

const metaById = Object.fromEntries(manifest.map(d => [d.id, d]));
const FALLBACK_ID = metaById.action4 ? 'action4' : manifest[0].id;
const config = ref(null);
const requestedId = computed(() => metaById[route.params.id] ? route.params.id : FALLBACK_ID);
const meta = computed(() => metaById[requestedId.value] || manifest[0]);

/* 缩略图模式（?thumb=1，离线渲染脚本用）：隐藏全部 UI、关闭自适应降档保证出图一致 */
const thumbMode = route.query.thumb === '1';

const device = computed(() => {
  if(config.value && config.value.id === meta.value.id) return config.value;
  /* 配置加载完成前的占位：模板只用到名称/品牌/GLB 等元数据字段 */
  return { ...meta.value, parts: [], specs: [], description: '', source: null };
});
const deviceIndex = computed(() => manifest.findIndex(d => d.id === device.value.id));
const prevDevice = computed(() => manifest[(deviceIndex.value - 1 + manifest.length) % manifest.length]);
const nextDevice = computed(() => manifest[(deviceIndex.value + 1) % manifest.length]);
function goDevice(d){ if(d && d.id !== device.value.id) router.push({ path: '/device/' + d.id, query: {} }); }

let loadSeq = 0;
async function loadConfig(id){
  const load = loaders[id];
  if(!load) throw new Error(`未找到设备配置：${id}`);
  const mod = await load();
  return mod.default;
}

const selectedPart = computed(() => device.value.parts.find(p => p.id === ui.value.selected) || null);
/* 部件详情卡「原理」区：命中知识库词条展开，未命中不渲染（不占位） */
const partTech = computed(() => techForPart(selectedPart.value && selectedPart.value.id));
const techOpen = ref(true);
watch(() => selectedPart.value && selectedPart.value.id, () => { techOpen.value = true; });
/* 代际对比入口：设备属于策展对比组时，信息浮层给出入口 */
const compareGroup = computed(() => compareGroupOf(device.value && device.value.id));
/* 探索系统（Phase 7）：收藏状态（本地 localStorage） */
const deviceFav = ref(false);
watch(() => device.value && device.value.id, (id) => { deviceFav.value = !!(id && isFavorite(id)); }, { immediate: true });
function toggleFav(id){ deviceFav.value = toggleFavStore(id); }
/* ---------- 我的评分（V2 第七章）：总体常显 + 展开式六维细分 + 个人备注，纯本地 ---------- */
const RATE_DIMS = [   // V2 第七章 7.2 六维
  { key: 'appearance', zh: '外观还原度' },
  { key: 'structure', zh: '内部结构还原度' },
  { key: 'parts', zh: '零件完整度' },
  { key: 'material', zh: '材质与贴图' },
  { key: 'explode', zh: '拆解展示效果' },
  { key: 'interact', zh: '交互体验' },
];
const rateExpanded = ref(false);
const myNote = ref('');
const rateVer = ref(0);
subscribeRatings(() => { rateVer.value++; });
const myRating = computed(() => { rateVer.value; const id = device.value && device.value.id; return (id && getRating(id)) || {}; });
const hasMyRating = computed(() => { rateVer.value; const id = device.value && device.value.id; return !!(id && getRating(id)); });
/* 备注草稿随设备切换同步（切台不串音）；不设 immediate——device 在后方声明，装载后 id 变化自然触发首同步 */
watch(() => device.value && device.value.id, (id) => {
  myNote.value = (id && getRating(id)?.note) || '';
});
function saveMyNote(){
  const id = device.value && device.value.id;
  if(!id) return;
  setRating(id, { note: myNote.value });
}
function setMyRating(dim, n){
  const id = device.value && device.value.id;
  if(!id) return;
  setRating(id, { [dim]: n });
  showToast(dim === 'overall' ? `已评 ${n} 星` : '已记录评价', 1200);
}
function clearMyRating(){
  const id = device.value && device.value.id;
  if(id) clearRating(id);
  showToast('已清除我的评分', 1200);
}

/* ---------- 收藏馆管理（V2 第六章）：分类 / 备注 / 收藏时间 ---------- */
const favCats = ref([]);
const deviceCats = ref([]);
const deviceNote = ref('');
const favAt = ref(null);
const newCatName = ref('');
function refreshFavMeta(){
  /* 纯读函数：绝不自增 favVer——favVer 在 watch 源数组里会自触发递归（V2 实测踩坑） */
  const id = device.value && device.value.id;
  favCats.value = getCats();
  const meta = id ? getFavMetaOf(id) : null;
  deviceCats.value = meta?.cats || [];
  deviceNote.value = meta?.note || '';
  favAt.value = meta?.at || null;
}
watch([deviceFav, () => device.value && device.value.id], refreshFavMeta, { immediate: true, flush: 'post' });
function toggleDeviceCat(cat){
  const id = device.value && device.value.id;
  if(!id) return;
  toggleFavCatStore(id, cat);
  refreshFavMeta();   // 事件处理器内直接重读（不经 favVer 防递归）
}
function addDeviceCat(){
  const name = newCatName.value.trim();
  if(!name) return;
  if(addCatStore(name)){
    const id = device.value && device.value.id;
    if(id && !getFavMetaOf(id)?.cats?.includes(name)) toggleFavCatStore(id, name);
    newCatName.value = '';
    refreshFavMeta();
    showToast(`已新建分类「${name}」并加入`, 1400);
  }else{
    showToast('分类已存在', 1200);
  }
}
function saveDeviceNote(){
  const id = device.value && device.value.id;
  if(!id) return;
  setFavNoteStore(id, deviceNote.value);   // deviceNote 为 v-model 实时值，无需重读
}
/* 视觉原理演示激活提示（示意动画标注） */
watch(() => ui.value.demoActive, (v, ov) => {
  if(v && v !== ov) showToast('视觉原理演示 · ' + v + '（示意动画，非仿真）', 3400);
});
const partIndex = computed(() => device.value.parts.findIndex(p => p.id === ui.value.selected));
/* 视角条与剖切条同位互斥：进入剖切即收起视角条 */
watch(() => ui.value.viewMode, (m) => { if(m === 'clip') viewStripOpen.value = false; });
/* 移动端详情 sheet 的实际高度：供 Tour / 剖切条 / toast 让位，避免被盖住 */
watch(selectedPart, (p) => {
  nextTick(() => {
    if(sheetRO){ sheetRO.disconnect(); sheetRO = null; }
    if(!p || !sheetEl.value){ sheetH.value = 0; return; }
    sheetH.value = sheetEl.value.offsetHeight;
    sheetRO = new ResizeObserver(() => {
      if(sheetEl.value) sheetH.value = sheetEl.value.offsetHeight;
    });
    sheetRO.observe(sheetEl.value);
  });
}, { flush: 'post' });
/* 部件特写小图：详情卡打开时离屏捕获（主画面不受干扰）。
   监听 [partId, booted]：切台时 selectedPart 可能先于引擎就绪，booted 变化后需重试 */
const partThumb = ref(null);
watch(
  [() => (selectedPart.value ? selectedPart.value.id : null), () => ui.value.booted],
  ([pid, booted]) => {
    partThumb.value = null;
    if(!pid || !booted || !engine) return;
    nextTick(() => {
      try { partThumb.value = engine.capturePartThumb(pid, 352); }
      catch(e) { console.warn('part thumb failed', e); }
    });
  },
  { flush: 'post' }
);
/* 泛化署名（"by community (Sketchfab)"）没有作者与许可证，明确标出待核实 */
const creditUnverified = computed(() => /by community/i.test(device.value.modelCredit || ''));
/* 许可证级别徽标：NC/SA 是有再分发约束的许可，需在 UI 上醒目区分（合规透明） */
const licenseFlag = computed(() => {
  const c = device.value.modelCredit || '';
  if(/CC-BY-NC/.test(c)) return { short: '非商业', full: 'CC-BY-NC · 非商业许可：未经权利人许可不得用于商业用途' };
  if(/CC-BY-SA/.test(c)) return { short: '同许可', full: 'CC-BY-SA · 相同方式共享：衍生作品须以相同许可发布' };
  return null;
});
const loadFailed = ref(false);
function reloadPage(){ location.reload(); }
const tour = computed(() => ui.value.tour);
/* 讲解朗读（Web Speech，本地合成；步进/停止/卸载时取消） */
const ttsOn = ref(false);
function toggleTts(){
  if(!('speechSynthesis' in window)){ showToast('当前浏览器不支持语音合成', 2400); return; }
  if(ttsOn.value){ speechSynthesis.cancel(); ttsOn.value = false; return; }
  const note = tour.value && tour.value.note;
  if(!note) return;
  const u = new SpeechSynthesisUtterance(note);
  u.lang = 'zh-CN'; u.rate = 1.0;
  u.onend = () => { ttsOn.value = false; };
  u.onerror = () => { ttsOn.value = false; };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  ttsOn.value = true;
}
watch([() => tour.value && tour.value.i, () => tour.value && tour.value.note], () => {
  if('speechSynthesis' in window) speechSynthesis.cancel();
  ttsOn.value = false;
});
onBeforeUnmount(() => { if('speechSynthesis' in window) speechSynthesis.cancel(); });
const explodePct = computed(() => ui.value.explode);
const qualityLabel = computed(() => ['LOW', 'MED', 'HIGH'][ui.value.quality ?? 2] || 'HIGH');
const sliderValue = computed(() => Math.round((scrubbing.value ? manualSlider : ui.value.explode) * 10));
const labelsName = computed(() => ({ auto: '自动', all: '全部', off: '关闭' })[ui.value.labelsMode] || '自动');

const statusShort = computed(() => {
  const s = ui.value.modelStatus || '';
  if(s.startsWith('LOADING')) return 'LOADING';
  if(s.startsWith('FALLBACK')) return 'FALLBACK';
  return s || 'INIT';
});
const statusTone = computed(() => {
  const s = ui.value.modelStatus || '';
  if(s.startsWith('OFFICIAL') || s.startsWith('COMMUNITY') || s === 'PROCEDURAL') return 'ok';
  if(s.startsWith('FALLBACK')) return 'warn';
  return '';
});

/* ---------- 分段加载进度 ---------- */
const loadStage = computed(() => {
  const s = ui.value.modelStatus || '';
  if(s.startsWith('LOADING')) return '加载官方模型';
  if(s === 'PARSING') return '编译材质';
  if(s === 'PROCEDURAL' || s.startsWith('OFFICIAL') || s.startsWith('COMMUNITY') || s.startsWith('FALLBACK')) return '装配';
  return '构建场景';
});
const loadPct = computed(() => {
  const s = ui.value.modelStatus || '';
  if(s.startsWith('LOADING')){
    const n = parseInt(s.slice(8)) || 0;
    return 10 + n * 0.8;               // 下载占 10%–90%
  }
  if(s === 'PARSING') return 92;
  if(loadStage.value === '装配') return 100;
  return 6;
});
const loadStageSub = computed(() => device.value.glb ? '官方 GLB 资产 · 流式下载' : '程序化建模');

/* ---------- 开场提示 / 临时消息 toast ---------- */
const toastShow = ref(false);
const toastMsg = ref('');
let toastTimer = null;
function showToast(msg, ms = 3000){
  toastMsg.value = msg;
  toastShow.value = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastShow.value = false; }, ms);
}

/* ---------- 开场演出（GSAP 只管 UI 编排，绝不接管 three 主循环） ---------- */
const bootTitleShow = ref(!thumbMode);
const bootScanRun = ref(false);
function bootTimeline(){
  if(thumbMode) return;
  if(reduceMotion){
    /* 减少动态：跳过开场编排，直接给出可操作界面 */
    bootTitleShow.value = false;
    bootScanRun.value = true;
    gsap.set(['#topbar', '#rail', '#dock', '#mpChips'], { clearProps: 'all' });
    showToast('点击部件查看详情 · ? 帮助', 2600);
    return;
  }
  const wide = window.matchMedia('(min-width: 701px)').matches;
  const targets = wide ? ['#topbar', '#rail', '#dock'] : ['#topbar', '#mpChips', '#dock'];
  gsap.set(targets, { opacity: 0 });
  if(wide) gsap.set('#rail', { x: -20 });
  gsap.set('#topbar', { y: -14 });
  gsap.set('#dock', { y: 18 });
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo('#bootTitle .bt-en', { opacity: 0, y: 26, letterSpacing: '.6em' }, { opacity: 1, y: 0, letterSpacing: '.3em', duration: .9 }, .05)
    .fromTo('#bootTitle .bt-zh', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7 }, .4)
    .to('#bootTitle', { opacity: 0, duration: .55, ease: 'power2.in' }, 1.9)
    .call(() => { bootTitleShow.value = false; }, null, 2.5)
    .to('#topbar', { y: 0, opacity: 1, duration: .5 }, 1.6)
    .to(wide ? '#rail' : '#mpChips', { x: 0, opacity: 1, duration: .5 }, 1.72)
    .to('#dock', { y: 0, opacity: 1, duration: .5 }, 1.84)
    .call(() => { bootScanRun.value = true; }, null, 2.3)
    .call(() => showToast('SPACE 一键拆解 · 点击部件查看详情 · ? 帮助', 3400), null, 2.6)
    .call(() => gsap.set(targets, { clearProps: 'all' }), null, 2.6);
  /* rAF 挂起环境兜底（IAB 后台等）：GSAP ticker 走不动时按墙钟漂移检测，直接跳到终态 */
  const t0 = Date.now();
  const safety = setInterval(() => {
    const wall = (Date.now() - t0) / 1000;
    if(tl.progress() >= 1){ clearInterval(safety); return; }
    if(wall > 2 && tl.time() < wall * 0.35){
      clearInterval(safety);
      tl.totalProgress(1, false);   // suppressEvents=false：call() 回调照常触发
    }
  }, 700);
}

/* ---------- URL 状态同步：#/device/action4?e=1&p=battery&t=1 ---------- */
let urlTimer = null;
function syncUrl(){
  if(thumbMode || pendingDeeplink) return;   // 深链应用前不回写，避免开场空状态清掉分享参数
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    const q = {};
    const et = ui.value.explodeTarget;
    if(et > 0.05) q.e = String(Math.round(et * 10) / 10);
    if(ui.value.selected) q.p = ui.value.selected;
    if(ui.value.tour && ui.value.tour.playing) q.t = '1';
    const cur = route.query;
    if(cur.e !== q.e || cur.p !== q.p || cur.t !== q.t){
      router.replace({ query: q }).catch(() => {});
    }
  }, 260);
}
/* 字符串键比较：getter 返回新数组会因引用不等在每次 emit 时误触发 */
watch(() => [ui.value.explodeTarget, ui.value.selected, ui.value.tour && ui.value.tour.playing].join('|'),
  (nv, ov) => { if(nv !== ov) syncUrl(); });

let pendingDeeplink = null;   // { p, t }：boot 后应用的分享参数
function applyDeeplink(){
  if(!pendingDeeplink || !engine) return;
  const { p, t } = pendingDeeplink;
  pendingDeeplink = null;
  if(p && device.value.parts.some(x => x.id === p)){
    engine.selectPart(p);
    engine.flyToPart(p);
  }
  if(t) setTimeout(() => engine && engine.startTour(), p ? 900 : 150);
}

/* ---------- 最近浏览 ---------- */
const RECENT_KEY = 'teardown-recent';
function pushRecent(id){
  if(thumbMode) return;
  try{
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter(x => x !== id);
    list.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  }catch{}
}

/* ---------- 交互动作 ---------- */
let manualSlider = 0;
function onSliderInput(e){
  const v = e.target.value / 1000;
  manualSlider = e.target.value;
  engine && engine.setExplode(v);
}
function onClipInput(e){ engine && engine.setClipT(e.target.value / 1000); }
function toggleExplode(){
  if(lpFired){ lpFired = false; return; }   // 长按切布局后松开，不再当 click 切拆解
  engine && engine.setExplode(ui.value.explodeTarget > 0.5 ? 0 : 1);
}
function setViewMode(m){
  if(!engine) return;
  if(m === 'isolate' && !ui.value.selected){ showToast('先点击选择一个部件，再进入隔离', 1800); return; }
  engine.setMode(ui.value.viewMode === m ? null : m, ui.value.selected);
}
function toggleMeasure(){
  if(!engine) return;
  const on = ui.value.tool !== 'measure';
  engine.setMeasure(on);
  if(on) showToast('测量：点击模型上两点 · 第三次点击重测 · M / Esc 退出', 3200);
}
function toggleStep(){
  if(!engine) return;
  const on = !ui.value.step;
  const ok = engine.stepAssembly(on);
  if(on && ok) showToast('逐步装配：‹ › 逐组拆装 · B / Esc 退出 · 拖动滑杆也可随时接管', 3600);
}
function cycleLabels(){
  if(!engine) return;
  const order = ['auto', 'all', 'off'];
  const next = order[(order.indexOf(ui.value.labelsMode) + 1) % order.length];
  engine.setLabels(next);
}
function toggleTour(){ if(!engine) return; ui.value.tour ? engine.stopTour() : engine.startTour(); }
function toggleImmersive(){ immersiveMode.value = !immersiveMode.value; }
function closeDetail(){ engine && engine.deselect(); }
function pickFromList(id){
  if(!engine) return;
  engine.selectPart(id);
  engine.flyToPart(id);
}
function shoot(){
  if(!engine) return;
  try{
    const url = engine.snapshot('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${device.value.en || device.value.id}-teardown.png`;
    a.click();
    showToast('截图已保存', 1500);
  }catch(err){ showToast('截图失败：' + (err && err.message || err), 2200); }
}
function startExperience(){
  showGuide.value = false;
  if(ui.value.explodeTarget < 0.5) engine && engine.setExplode(1);
}
function toggleRail(){
  railOpen.value = !railOpen.value;
  try{ localStorage.setItem('teardown-rail', railOpen.value ? '1' : '0'); }catch{}
}
/* 零件导航模式（V2）：'list' 清单 | 'grid' 宫格；记忆用户偏好 */
const railMode = ref((() => { try{ return localStorage.getItem('teardown-rail-mode') === 'grid' ? 'grid' : 'list'; }catch{ return 'list'; } })());
function toggleRailMode(){
  railMode.value = railMode.value === 'list' ? 'grid' : 'list';
  railOpen.value = true;   // 切模式时展开，所见即所得
  try{ localStorage.setItem('teardown-rail-mode', railMode.value); }catch{}
}

/* dock 拆解键长按：切换爆炸布局（axis ↔ radial）；长按后松开不再触发 click 的拆解切换 */
let lpTimer = null;
let lpFired = false;
function lpStart(){
  lpFired = false;
  lpTimer = setTimeout(() => {
    lpTimer = null;
    lpFired = true;
    if(!engine) return;
    const next = ui.value.layout === 'radial' ? 'axis' : 'radial';
    engine.setExplodeLayout(next);
    showToast(next === 'radial' ? '径向布局 · 花瓣排布' : '轴向布局 · 语义方向', 1600);
  }, 520);
}
function lpEnd(){ clearTimeout(lpTimer); lpTimer = null; }

/* ---------- 键盘 ---------- */
function onKey(e){
  if(e.target instanceof HTMLInputElement) return;   // 滑杆聚焦时方向键归滑杆
  const touring = !!(ui.value.tour && ui.value.tour.playing);
  if(e.code === 'ArrowRight'){
    if(ui.value.step){ engine && engine.stepNext(); }        // 逐步装配优先于导览/切台
    else if(touring){ engine && engine.tourNext(); }
    else{ goDevice(nextDevice.value); }
  }
  else if(e.code === 'ArrowLeft'){
    if(ui.value.step){ engine && engine.stepPrev(); }
    else if(touring){ engine && engine.tourPrev(); }
    else{ goDevice(prevDevice.value); }
  }
  else if(e.code === 'Space'){ e.preventDefault(); toggleExplode(); }
  else if(e.code === 'Digit1'){ engine && engine.setMode(null); }
  else if(e.code === 'Digit2'){ setViewMode('xray'); }
  else if(e.code === 'Digit3'){ setViewMode('isolate'); }
  else if(e.code === 'Digit4'){ setViewMode('clip'); }
  else if(e.code === 'Digit5'){ viewStripOpen.value = true; flyView('front'); }
  else if(e.code === 'Digit6'){ viewStripOpen.value = true; flyView('back'); }
  else if(e.code === 'Digit7'){ viewStripOpen.value = true; flyView('left'); }
  else if(e.code === 'Digit8'){ viewStripOpen.value = true; flyView('right'); }
  else if(e.code === 'Digit9'){ viewStripOpen.value = true; flyView('interior'); }
  else if(e.code === 'KeyV'){ viewStripOpen.value = !viewStripOpen.value; }
  else if(e.code === 'KeyN'){ toggleHall(); }
  else if(e.code === 'KeyM'){ toggleMeasure(); }
  else if(e.code === 'KeyB'){ toggleStep(); }
  else if(e.code === 'KeyF'){ ui.value.selected && engine && engine.flyToPart(ui.value.selected); }
  else if(e.code === 'KeyT'){ toggleTour(); }
  else if(e.code === 'KeyS'){ shoot(); }
  else if(e.code === 'KeyL'){ cycleLabels(); }
  else if(e.code === 'KeyR'){ engine && engine.resetView(); }
  else if(e.code === 'KeyH'){ toggleImmersive(); }
  else if(e.key === '?'){ showGuide.value = !showGuide.value; }
  else if(e.code === 'Escape'){
    if(showGuide.value) showGuide.value = false;
    else if(viewStripOpen.value) viewStripOpen.value = false;
    else if(infoOpen.value) infoOpen.value = false;
    else if(immersiveMode.value) immersiveMode.value = false;
    else if(ui.value.tool === 'measure') toggleMeasure();   // 先退出测量工具
    else if(ui.value.step) toggleStep();                    // 逐步装配：先补齐装配再退出
    else if(ui.value.viewMode) setViewMode(ui.value.viewMode);   // 退出查看模式
    else engine && engine.deselect();   // 退出聚焦：取消选中 + 相机回全景
  }
}

function applyQueryState(){
  const q = route.query;
  const hasE = q.e !== undefined && isFinite(parseFloat(q.e));
  const hasP = !!q.p, hasT = q.t === '1';
  if(hasP || hasT) pendingDeeplink = { p: q.p, t: hasT };
  return { hasE, e: hasE ? Math.min(1, Math.max(0, parseFloat(q.e))) : 0 };
}

onMounted(async () => {
  gizmoRaf = requestAnimationFrame(drawGizmo);   // 坐标辅助 gizmo 循环
  isMobile.value = mobileMq.matches;
  mobileMq.addEventListener('change', onMobileMq);
  try{ railOpen.value = localStorage.getItem('teardown-rail') !== '0' && !isMobile.value; }
  catch{ railOpen.value = !isMobile.value; }
  if(!thumbMode) window.addEventListener('keydown', onKey);

  const q = applyQueryState();
  const mountedId = requestedId.value;
  const seq = ++loadSeq;
  loadFailed.value = false;
  try{
    engine = createEngine(canvasRef.value, labelsRef.value, {
      onChange: (s) => { ui.value = { ...s }; },
      onBooted: () => bootTimeline(),
      adaptive: !thumbMode,
      reducedMotion: reduceMotion
    });
    window.__ENGINE = engine;
    applyHall(hall.value);   // 双厅模式恢复（引擎光照 + CSS 主题）
    const cfg = await loadConfig(mountedId);
    if(seq !== loadSeq || !engine) return;
    config.value = cfg;
    /* deeplink/爆炸度在装载完成（部件就绪）后应用，避免被 loadDevice 的 dispose 清掉；
       已切台则废弃挂载期的参数（新台有自己的 URL 状态） */
    await engine.loadDevice(cfg, { intro: !q.hasE && !pendingDeeplink });
    if(seq !== loadSeq || !engine || requestedId.value !== mountedId) return;
    if(q.hasE) engine.setExplode(q.e);
    applyDeeplink();
    pushRecent(cfg.id);
    markExplored(cfg.id, cfg.brand);   // 探索足迹（Phase 7）
  }catch(err){
    if(seq !== loadSeq) return;
    window.__ENGINE_ERR = (err && (err.stack || err.message)) || String(err);
    console.error(err);
    loadFailed.value = true;
    showToast('设备配置加载失败', 2400);
    gsap.set(['#topbar', '#rail', '#dock'], { clearProps: 'all' });   // 引擎挂了也要让 UI 可见
  }
});
watch(() => route.params.id, async (id) => {
  const rid = metaById[id] ? id : FALLBACK_ID;
  if(!engine) return;
  const seq = ++loadSeq;
  showGuide.value = false; infoOpen.value = false; viewStripOpen.value = false;
  ui.value.booted = false;
  if(route.query.e || route.query.p || route.query.t) router.replace({ query: {} }).catch(() => {});
  pendingDeeplink = null;
  config.value = null;
  loadFailed.value = false;
  engine.setAutoRotate(false);   // 上一台的待机自转会带走方位角，切台后停转并回位
  try{
    const cfg = await loadConfig(rid);
    if(seq !== loadSeq || !engine) return;
    config.value = cfg;
    await engine.loadDevice(cfg, { intro: false });
    if(seq !== loadSeq || !engine) return;
    engine.resetView();
    pushRecent(cfg.id);
    markExplored(cfg.id, cfg.brand);   // 探索足迹（Phase 7）
  }catch(err){
    if(seq !== loadSeq) return;
    window.__ENGINE_ERR = (err && (err.stack || err.message)) || String(err);
    console.error(err);
    loadFailed.value = true;
    showToast('设备配置加载失败', 2400);
  }
});
onBeforeUnmount(() => {
  loadSeq++;
  cancelAnimationFrame(gizmoRaf);   // 坐标辅助 gizmo 循环停止
  window.removeEventListener('keydown', onKey);
  mobileMq.removeEventListener('change', onMobileMq);
  if(sheetRO){ sheetRO.disconnect(); sheetRO = null; }
  clearTimeout(urlTimer); clearTimeout(toastTimer); clearTimeout(lpTimer);
  engine && engine.dispose();
  engine = null;
});
</script>
