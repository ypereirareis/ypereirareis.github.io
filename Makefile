step=--------------------------------
project=Blog YPEREIRAREIS
projectCompose=blog-ypereirareis
compose = docker-compose -p $(projectCompose)

install: remove bundle jkbuild jkserve

bundle:
	@echo "$(step) Bundler $(step)"
	@$(compose) run --rm web /bin/bash -ci '\
                bundle install && \
                    bundle check && \
                    bundle update'

jkbuild:
	@echo "$(step) Jekyll build $(step)"
	@$(compose) run --rm web jekyll build

jkserve:
	@echo "$(step) Jekyll Serve $(step)"
	@$(compose) up -d web

start: stop jkbuild jkserve

stop:
	@echo "$(step) Stopping $(project) $(step)"
	@$(compose) stop
state:
	@echo "$(step) Etat $(project) $(step)"
	@$(compose) ps

remove: stop
	@echo "$(step) Remove $(project) $(step)"
	@$(compose) rm --force

bash:
	@echo "$(step) Bash $(project) $(step)"
	@$(compose) run --rm web /bin/bash

tests:
	@echo "$(step) Bash $(project) $(step)"
	@$(compose) run -u jekyll --rm web /bin/bash -c './tests.sh'


NGINX_CERT_DIR=~/.ariase/nginx/certs

gen-ssl-certificate:
	sudo openssl genrsa -out $(NGINX_CERT_DIR)/perso.key 2048
	sudo openssl req -new -key $(NGINX_CERT_DIR)/perso.key -out $(NGINX_CERT_DIR)/perso.csr
	sudo openssl req -x509 -days 365 -key $(NGINX_CERT_DIR)/perso.key -in $(NGINX_CERT_DIR)/perso.csr -out $(NGINX_CERT_DIR)/perso.crt

nginx-proxy:
	@echo "Removing NGINX REVERSE PROXY"
	@$(shell docker rm -f reverseproxy > /dev/null 2> /dev/null || true)
	@echo "Starting NGINX REVERSE PROXY"
	@$(shell docker run -d --name reverseproxy --net=nginx-proxy -p 80:80 -p 443:443 -v $(NGINX_CERT_DIR):/etc/nginx/certs -v /var/run/docker.sock:/tmp/docker.sock jwilder/nginx-proxy > /dev/null 2> /dev/null || true)
