module.exports = {
    apps: [{
      name: 'tesis-api',
      script: '/Users/alangarcia/Documents/Alan/Maestria/Tesis/projecto/venv/bin/activate',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: '200M',
      env_production: {
        NODE_ENV: 'production'
      }
    }]
  };
