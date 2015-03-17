# **Yannick PEREIRA-REIS**  

[Résumé/CV](resume.md)


## Docker

`docker run -it --rm -v $(pwd):/app docker-ypereirareis npm install`

`docker run -it --rm -v $(pwd):/app docker-ypereirareis bower install --allow-root install`

`docker run -it --rm -v $(pwd):/app docker-ypereirareis jekyll build`

`docker run -it --rm -v $(pwd):/app docker-ypereirareis grunt`

`docker run -it --rm -p 4000:4000 -v $(pwd):/app docker-ypereirareis jekyll serve -H 0.0.0.0`
