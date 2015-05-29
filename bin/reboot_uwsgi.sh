kill -HUP $(ps aux | grep uwsgi | head -1 | awk '{print $2}')
