import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { monitorEventLoopDelay } from 'node:perf_hooks';

import { performance } from 'node:perf_hooks';

import os from 'node:os';

@Injectable()
export class PerformanceService implements OnModuleInit, OnModuleDestroy {
  private eventLoopMonitor = monitorEventLoopDelay({
    resolution: 20,
  });

  private previousCpu = process.cpuUsage();
  private previousTime = process.hrtime.bigint();

  private activeConnections = 0;
  private totalConnections = 0;
  private totalMessages = 0;

  onModuleInit() {
    this.eventLoopMonitor.enable();
  }

  onModuleDestroy() {
    this.eventLoopMonitor.disable();
  }

  connectionOpened() {
    this.activeConnections++;
    this.totalConnections++;
  }

  connectionClosed() {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
  }

  messageReceived() {
    this.totalMessages++;
  }

  getMetrics() {
    const cpu = process.cpuUsage(this.previousCpu);

    const now = process.hrtime.bigint();

    const elapsedMicroseconds = Number(now - this.previousTime) / 1000;

    const cpuTime = cpu.user + cpu.system;

    // CPU usage relative to one CPU core
    const cpuPercent =
      elapsedMicroseconds > 0 ? (cpuTime / elapsedMicroseconds) * 100 : 0;

    this.previousCpu = process.cpuUsage();
    this.previousTime = now;

    const memory = process.memoryUsage();

    const heapUsedPercent =
      memory.heapTotal > 0 ? (memory.heapUsed / memory.heapTotal) * 100 : 0;

    return {
      timestamp: new Date().toISOString(),

      process: {
        pid: process.pid,
        uptimeSeconds: process.uptime(),
      },

      cpu: {
        processPercent: Number(cpuPercent.toFixed(2)),
        machineCores: os.cpus().length,
      },

      memory: {
        rssMB: Number((memory.rss / 1024 / 1024).toFixed(2)),
        heapUsedMB: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
        heapTotalMB: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
        externalMB: Number((memory.external / 1024 / 1024).toFixed(2)),
        heapUsedPercent: Number(heapUsedPercent.toFixed(2)),
      },

      eventLoop: {
        meanMs: Number((this.eventLoopMonitor.mean / 1e6).toFixed(2)),
        maxMs: Number((this.eventLoopMonitor.max / 1e6).toFixed(2)),
        p99Ms: Number((this.eventLoopMonitor.percentile(99) / 1e6).toFixed(2)),
      },

      websocket: {
        activeConnections: this.activeConnections,
        totalConnections: this.totalConnections,
        totalMessages: this.totalMessages,
      },
    };
  }
}
