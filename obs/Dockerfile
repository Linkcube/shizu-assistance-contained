FROM bandi13/gui-docker:1.5

USER root

RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update -y \
    && apt-get install -y software-properties-common \
    && apt-get install -y vlc \
    && add-apt-repository -y ppa:obsproject/obs-studio \
    && apt-get update -y \
    && apt-get install -y obs-studio \
    && apt-get clean -y

RUN apt-get install -y firefox \
    && apt-get install -y desktop-file-utils

RUN echo "?package(bash):needs=\"X11\" section=\"DockerCustom\" title=\"OBS Screencast\" command=\"obs\"" >> /usr/share/menu/custom-docker && update-menus

USER dockerUser

COPY obs_hijack_script.py /usr/share/obs/obs-plugins/frontend-tools/scripts/obs_hijack_sctipt.py
COPY basic.ini /home/dockerUser/.config/not-obs-studio/basic/profiles/Untitled/basic.ini
COPY global.ini /home/dockerUser/.config/not-obs-studio/global.ini
