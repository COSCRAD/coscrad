def nodeInstallationName = 'NodeJS 18.12.0'

/* groovylint-disable DuplicateStringLiteral */
/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '5', numToKeepStr: '5')
        disableConcurrentBuilds()
    }
    stages {
        stage('ci') {
            agent {
                label 'jenkins-build-agent'
            }
            tools { nodejs nodeInstallationName }
            environment {
                NODE_ENV = 'test'
                NODE_PORT = 3131
                ARANGO_DB_HOST_DOMAIN = 'arangotest.digiteched.com'
                ARANGO_DB_HOST_SCHEME = 'https'
                ARANGO_DB_HOST_PORT = 443
                ARANGO_DB_ROOT_PASSWORD = credentials('arango-test-root-password')
                ARANGO_DB_USER = 'dbuser'
                ARANGO_DB_USER_PASSWORD = credentials('arango-test-db-user-password')
                ARANGO_DB_NAME = 'staging'
                AUTH0_ISSUER_URL = 'https://foo.auth0.com/'
                AUTH0_AUDIENCE = 'https://bar.mydomain.ca'
                GLOBAL_PREFIX = 'api'
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT = 'false'
            }
            when {
                // TODO put me back
                // branch 'PR-*'
                expression { return false }
            }
            steps {
                copyConfig('COSCRAD')
                configFileProvider([configFile(fileId:'staging.auth.config',  \
            targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
                    echo 'PR opened or updated...'
                    echo "NODE ENV: ${NODE_ENV}"
                    echo 'node version:'
                    sh 'node -v'
                    echo 'npm version'
                    sh 'npm -v'
                    echo 'Installing dependencies'
                    sh 'npm ci --legacy-peer-deps'

                    echo 'Running lint on all COSCRAD projects'
                    sh 'npm run lint:coscrad'

                    echo 'Building COSCRAD'
                    echo 'with node version'
                    sh 'node --version'
                    sh 'npm run build:coscrad:prod'

                    echo 'testing coscrad-frontend'
                    sh 'npx nx test coscrad-frontend --skip-nx-cache'

                    echo 'testing api (coscrad back-end)'

                /**
                * While the test falls back to `process.env` whenever there is
                * no value from `test.env` we have added an empty `test.env`
                * as a hack because by some quirk the mock config implementation
                * fails when no file is found.
                **/
                    echo 'creating empty test.env file'
                /* groovylint-disable-next-line LineLength */
                    sh 'touch apps/api/src/app/config/test.env'

                    sh 'npx nx test api --skip-nx-cache'
            }
            }
        }
        stage('build and deploy to staging') {
            agent {
                label 'jenkins-build-agent'
            }
            tools { nodejs nodeInstallationName }
            environment {
                // This is so that webpack will optimize the build
                NODE_ENV = 'production'
                NODE_PORT = 3131
                ARANGO_DB_HOST_DOMAIN = 'arangotest.digiteched.com'
                ARANGO_DB_HOST_SCHEME = 'https'
                ARANGO_DB_HOST_PORT = 443
                ARANGO_DB_ROOT_PASSWORD = credentials('arango-test-root-password')
                ARANGO_DB_USER = 'dbuser'
                ARANGO_DB_USER_PASSWORD = credentials('arango-test-db-user-password')
                ARANGO_DB_NAME = 'staging'
                AUTH0_ISSUER_URL = 'https://foo.auth0.com/'
                AUTH0_AUDIENCE = 'https://bar.mydomain.ca'
                GLOBAL_PREFIX = 'api'
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT = 'false'
            }
            when {
                // TODO return this to integration
                branch 'PR-*'
            }
            // when {
            //     expression {
            //         return env.BRANCH_NAME == 'integration'
            //     }
            // }
            steps {
                copyConfig('COSCRAD')
                configFileProvider([configFile(fileId:'staging.auth.config',  \
            targetLocation: 'apps/coscrad-frontend/src/auth_config.json')]) {
                    runCoscradBuild()
            }
            }
                post {
                    success {
                        archiveArtifacts artifacts: 'dist/**, node_modules/**', followSymlinks: false
                    // Deploy front-end build to staging
                    sshPublisher(
                        publishers: [sshPublisherDesc(configName: 'coscradmin@staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf /var/www/html && mv build/dist/apps/coscrad-frontend /var/www/html && rm -rf build', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])

                    // Deploy back-end build to staging
                    sshPublisher(
                        publishers: [sshPublisherDesc(configName: 'coscradmin@api.staging.digiteched.com', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: 'rm -rf archive ; mv build archive; touch archive/dist/apps/api/staging.env; PATH=$PATH://home/coscradmin/.nvm/versions/node/v18.16.0/bin pm2 restart main; echo API restarted', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'build', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'dist/**, node_modules/**')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                    }
                }
        }
    }
}

String getContentConfigFilename(String target) {
    if (target == 'COSCRAD') { return 'content.config.SAMPLE.ts' }

    if (target == 'Haida') { return 'content.config.STAGING.ts' }

    error "unsupported deployment target: ${target}"
}

/**
* # Available Targets
 - COSCRAD
 - Haida
**/
void copyConfig(String target) {
    String contentConfigDirectory = 'apps/coscrad-frontend/src/configurable-front-matter/data/'

    /**
    * Note that the sample content config is actually valid for
    * our staging build.
    **/
    echo "attempting to copy sample content config for test build for target ${target}"

    /* groovylint-disable-next-line LineLength */
    sh "cp ${contentConfigDirectory}${getContentConfigFilename(target)} ${contentConfigDirectory}content.config.ts"
    return
}

void runCoscradBuild() {
    echo 'Building COSCRAD for deployment'
    echo "NODE ENV: ${NODE_ENV}"
    echo 'Installing dependencies'
    sh 'npm ci --legacy-peer-deps'

    echo 'Building COSCRAD'
    echo 'with node version'
    sh 'node --version'

    sh 'npx nx build coscrad-frontend --prod'

    sh 'npx nx build api --prod'

    sh 'npx nx run api:build:cli'
}
