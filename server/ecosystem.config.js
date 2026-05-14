module.exports = {
  apps: [{
    name: 'liujing-api',
    script: 'app.js',
    cwd: '/home/freak/Desktop/liujing-web/server',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/tmp/liujing-api-err.log',
    out_file: '/tmp/liujing-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_memory_restart: '500M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
