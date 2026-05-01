FROM docker.io/library/ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Minimal toolchain to bootstrap Ansible. The GNOME role is guarded with
# `not is_container` and is skipped at converge time, so no desktop packages
# are needed in the test image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 python3-pip ansible openssh-server ca-certificates sudo \
    && rm -rf /var/lib/apt/lists/*
