#!/bin/bash

set -eo pipefail

export WWWUSER=${WWWUSER:-$(id -u)}
export WWWGROUP=${WWWGROUP:-$(id -g)}
export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-"tsm-integrations"}

if [ ! -f ".devconfig" ]; then
    echo "Initialize .devconfig first."
    exit 1
fi

if [ -f ".devconfig" ]; then
    source .devconfig
fi


cmd="${1:-}"
shift || true

if [ -z "$cmd" ]; then
    show_help >&2; exit 1
fi

docker_exec() {
    docker-compose exec -u sail app "$@"
}


case "$cmd" in
    -h|--help|help)
        show_help
        ;;
    init)
        ./workspace/scripts/init.sh
        ./workspace/scripts/install_precommit_file.sh
        ;;
    install-precommit)
        ./workspace/scripts/install_precommit_file.sh
        ;;
    rebuild)
        docker-compose build
        ;;
    composer)
        docker_exec composer "$@"
        ;;
    up)
        docker-compose up -d
        ;;
    down)
        docker-compose down
        ;;
    destroy)
        docker-compose rm -svf
        docker volume rm "$(docker volume ls -q | grep "^$COMPOSE_PROJECT_NAME")"
        ;;
    pint)
        docker_exec php vendor/bin/pint "$@"
        ;;
    encrypt-env)
        env_var_name=$(echo "$1_ENCRYPTION_KEY" | tr '[:lower:]' '[:upper:]')
        if [ -z "${!env_var_name}" ]; then
            echo "No $env_var_name found in .devconfig"
            exit 1
        fi

        if [ "$1" == "local" ]; then
            docker_exec php artisan env:encrypt --key="${!env_var_name}" --force
        else
            docker_exec php artisan env:encrypt --key="${!env_var_name}" --env="$1" --force
        fi
        ;;
    decrypt-env)
        env_var_name=$(echo "$1_ENCRYPTION_KEY" | tr '[:lower:]' '[:upper:]')
        if [ -z "${!env_var_name}" ]; then
            echo "No $env_var_name found in .devconfig"
            exit 1
        fi

        if [ "$1" == "local" ]; then
            docker_exec php artisan env:decrypt --key="${!env_var_name}" --force
        else
            docker_exec php artisan env:decrypt --key="${!env_var_name}" --env="$1" --force
        fi
        ;;
    artisan)
        docker_exec php artisan "$@"
        ;;
    *)
        docker_exec php artisan "$cmd" "$@"
        ;;
esac
