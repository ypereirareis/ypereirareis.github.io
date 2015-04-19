FROM ypereirareis/docker-node-modules

MAINTAINER Yannick Pereira-Reis <yannick.pereira.reis@gmail.com>

ENV USERNAME bob
ENV USERHOME /home/$USERNAME
ENV USERID 1000

# Install common libs
RUN apt-get update && apt-get install -y \
	ruby \
	ruby-dev \
	make \
	gcc \
	rubygems-integration 

RUN apt-get update && apt-get install -qqy libgtk2.0-0 libgdk-pixbuf2.0-0 libfontconfig1 libxrender1 libx11-6 libglib2.0-0  libxft2 libfreetype6 libc6 zlib1g libpng12-0 libstdc++6-4.8-dbg-arm64-cross libgcc1

# Install jekyll
RUN gem install jekyll

RUN groupadd -f -g $USERID $USERNAME && \
    useradd -u $USERID -g $USERNAME $USERNAME && \
    mkdir -p $USERHOME

RUN chown -R $USERNAME:$USERNAME $USERHOME

RUN adduser bob sudo

USER bob

VOLUME ["/app"]

WORKDIR /app

EXPOSE 4000

CMD []
