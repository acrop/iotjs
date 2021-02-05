#!/usr/bin/env python

# Copyright 2017-present Samsung Electronics Co., Ltd. and other contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import sys
import argparse

from common_py.system.filesystem import FileSystem as fs
from common_py.system.executor import Executor as ex
from common_py.system.sys_platform import Platform
from check_tidy import check_tidy

platform = Platform()

DOCKER_ROOT_PATH = fs.join('/root')

# IoT.js path in host
HOST_IOTJS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# IoT.js path in docker
DOCKER_IOTJS_PATH = fs.join(DOCKER_ROOT_PATH, 'work_space/iotjs')

# Node server script path in host
HOST_NODE_SERVER_JS_PATH = os.path.join(HOST_IOTJS_PATH, 'test/test-server/server.js')

# Node server path in docker
DOCKER_NODE_SERVER_PATH = fs.join(DOCKER_ROOT_PATH, 'work_space/node_server')

# Node server script path in docker
DOCKER_NODE_SERVER_JS_PATH = fs.join(DOCKER_NODE_SERVER_PATH, 'server.js')

DOCKER_TIZENRT_PATH = fs.join(DOCKER_ROOT_PATH, 'TizenRT')
DOCKER_TIZENRT_OS_PATH = fs.join(DOCKER_TIZENRT_PATH, 'os')
DOCKER_TIZENRT_OS_TOOLS_PATH = fs.join(DOCKER_TIZENRT_OS_PATH, 'tools')

DOCKER_NUTTX_PATH = fs.join(DOCKER_ROOT_PATH, 'nuttx')
DOCKER_NUTTX_TOOLS_PATH = fs.join(DOCKER_NUTTX_PATH, 'tools')
DOCKER_NUTTX_APPS_PATH = fs.join(DOCKER_ROOT_PATH, 'apps')

DOCKER_NAME = 'iotjs_docker'
DOCKER_TAG = 'lygstate/iotjs:latest'
BUILDTYPES = ['debug', 'release']
JERRY_PROFILES = ['es5.1', 'es.next']
TIZENRT_TAG = '2.0_Public_M2'

# Common buildoptions for sanitizer jobs.
BUILDOPTIONS_SANITIZER = [
    '--compile-flag=-fno-common',
    '--compile-flag=-fno-omit-frame-pointer',
    '--no-check-valgrind',
    '--no-snapshot',
]

def start_container():
    run_docker()
    start_mosquitto_server()
    start_node_server()

def run_docker():
    ex.check_run_cmd('docker', ['pull', DOCKER_TAG])
    try:
        ex.check_run_cmd('docker', ['rm', '-f', DOCKER_NAME])
    except:
        pass
    ex.check_run_cmd('docker', ['run', '-di', '--privileged',
                     '--name', DOCKER_NAME,
                     '-v', '%s:%s' % (HOST_IOTJS_PATH, DOCKER_IOTJS_PATH),
                     '-v', '%s:%s' % (HOST_NODE_SERVER_JS_PATH, DOCKER_NODE_SERVER_JS_PATH),
                     '--add-host', 'test.mosquitto.org:127.0.0.1',
                     '--add-host', 'echo.websocket.org:127.0.0.1',
                     '--add-host', 'httpbin.org:127.0.0.1',
                     DOCKER_TAG])
    exec_docker(DOCKER_IOTJS_PATH, ['npm', 'install'])

def exec_docker(cwd, cmd, env=[], is_background=False):
    exec_cmd = 'cd %s && ' % cwd + ' '.join(cmd)
    if is_background:
        docker_args = ['exec', '-d']
    else:
        docker_args = ['exec', '-t']

    for e in env:
        docker_args.append('-e')
        docker_args.append(e)

    docker_args += [DOCKER_NAME, 'bash', '-c', exec_cmd]
    ex.check_run_cmd('docker', docker_args)

def start_mosquitto_server():
    exec_docker(DOCKER_ROOT_PATH, ['mosquitto', '-d'], [], True)

def start_node_server():
    exec_docker(DOCKER_NODE_SERVER_PATH, ['node', 'server.js'], [], True)

def set_config_tizenrt(buildtype):
    exec_docker(DOCKER_ROOT_PATH, [
                'cp',
                fs.join(DOCKER_IOTJS_PATH,
                        'config/tizenrt/artik05x/configs/',
                        buildtype, 'defconfig'),
                fs.join(DOCKER_TIZENRT_OS_PATH, '.config')])

def build_iotjs(buildtype, args=[], env=[]):
    cmd_args = ['./tools/build.py',
                '--buildtype=' + buildtype] + args
    print(' '.join(cmd_args))
    exec_docker(DOCKER_IOTJS_PATH, cmd_args, env)

JOBS = dict()

def init_options():
    argv = sys.argv[1:]

    # Prepare argument parser.
    parser = argparse.ArgumentParser(description='Building tool for IoT.js '
        'JavaScript framework for embedded systems.')

    iotjs_build_group = parser.add_argument_group('Arguments of building IoT.js',
        'The following arguments are related to building IoT.js framework.')
    iotjs_build_group.add_argument('--buildtype',
        choices=['debug', 'release'], default=None, type=str.lower,
        help='Specify the build type (default: %(default)s).')
    iotjs_build_group.add_argument('--profile',
        help='Specify the module profile file for IoT.js')
    iotjs_build_group.add_argument('--jerry-profile',
        metavar='FILE', action='store', default=None,
        help='Specify the profile for JerryScript (default: %(default)s). '
             'Possible values are "es5.1", "es.next" or an absolute '
             'path to a custom JerryScript profile file.')
    iotjs_build_group.add_argument('--target-arch',
        choices=['arm', 'x86', 'i686', 'x86_64', 'x64', 'mips', 'noarch'],
        default=platform.arch(),
        help='Specify the target architecture (default: %(default)s).')
    iotjs_build_group.add_argument('--no-check-valgrind',
        action='store_true', default=False,
        help='Disable test execution with valgrind after build')
    iotjs_build_group.add_argument('--cmake-param',
        action='append', default=[],
        help='Specify additional cmake parameters '
             '(can be used multiple times)')
    iotjs_build_group.add_argument('--jerry-cmake-param',
        action='append', default=[],
        help='Specify additional cmake parameters for JerryScript '
        '(can be used multiple times)')
    iotjs_build_group.add_argument('--jerry-heaplimit',
        type=int, default=None,
        help='Specify the size of the JerryScript max heap size '
                '(default: %(default)s)')
    iotjs_build_group.add_argument('--external-modules',
        action='store', default=set(), type=lambda x: set(x.split(',')),
        help='Specify the path of modules.json files which should be processed '
             '(format: path1,path2,...)')
    iotjs_build_group.add_argument('--clean', action='store_true', default=False,
        help='Clean build directory before build (default: %(default)s)')
    iotjs_build_group.add_argument('--compile-flag',
        action='append', default=[],
        help='Specify additional compile flags (can be used multiple times)')
    options = parser.parse_args(argv)
    if options.buildtype is None:
        options.BUILDTYPES = BUILDTYPES
    else:
        argv = [arg for arg in argv if not arg.startswith('--buildtype=')]
        options.BUILDTYPES = [options.buildtype]
    if options.jerry_profile is None:
        options.JERRY_PROFILES = JERRY_PROFILES
    else:
        argv = [arg for arg in argv if not arg.startswith('--jerry-profile=')]
        options.JERRY_PROFILES = [options.jerry_profile]
    argv = argv + ['--run-test=full']
    if len(options.JERRY_PROFILES) == 2 and not options.clean:
        options.clean = True
        argv = argv + ['--clean']
    options.argv = argv
    return options

class job(object):
    def __init__(self, name):
        self.name = name
    def __call__(self, fn):
        JOBS[self.name] = fn

@job('linux')
def job_linux(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, options.argv + [
                        '--jerry-profile=' + jerry_profile,
                        '--cmake-param=-DENABLE_MODULE_ASSERT=ON',
                    ])

@job('linux-asan')
def job_asan(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, options.argv + [
                        '--jerry-profile=' + jerry_profile,
                        '--compile-flag=-fsanitize=address',
                        ] + BUILDOPTIONS_SANITIZER,
                        ['ASAN_OPTIONS=detect_stack_use_after_return=1:'
                        'check_initialization_order=true:strict_init_order=true',
                        'TIMEOUT=600'])

@job('linux-ubsan')
def job_ubsan(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, options.argv + [
                            '--jerry-profile=' + jerry_profile,
                            '--compile-flag=-fsanitize=undefined',
                        ] + BUILDOPTIONS_SANITIZER,
                        ['UBSAN_OPTIONS=print_stacktrace=1', 'TIMEOUT=600']
                        )

@job('linux-no-snapshot')
def job_no_snapshot(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, options.argv + [
                            '--jerry-profile=' + jerry_profile,
                            '--no-snapshot',
                    ])

@job('linux-mock')
def job_linux_mock(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, [
                            '--jerry-profile=' + jerry_profile,
                            '--target-os=mock',
                            '--profile=test/profiles/mock-linux.profile',
                        ])

@job('rpi2')
def job_rpi2(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            build_iotjs(buildtype, [
                        '--jerry-profile=' + jerry_profile,
                        '--target-arch=arm',
                        '--target-board=rpi2',
                        '--profile=test/profiles/rpi2-linux.profile'])

@job('stm32f4dis')
def job_stm32f4dis(options):
    start_container()

    # Copy the application files to apps/system/iotjs.
    exec_docker(DOCKER_ROOT_PATH, [
                'cp', '-r',
                fs.join(DOCKER_IOTJS_PATH,'config/nuttx/stm32f4dis/app/'),
                fs.join(DOCKER_NUTTX_APPS_PATH, 'system/iotjs/')])

    exec_docker(DOCKER_ROOT_PATH, [
                'cp', '-r',
                fs.join(DOCKER_IOTJS_PATH,
                        'config/nuttx/stm32f4dis/config.travis'),
                fs.join(DOCKER_NUTTX_PATH,
                        'configs/stm32f4discovery/usbnsh/defconfig')])

    for buildtype in options.BUILDTYPES:
        exec_docker(DOCKER_NUTTX_PATH, ['make', 'distclean'])
        exec_docker(DOCKER_NUTTX_TOOLS_PATH,
                    ['./configure.sh', 'stm32f4discovery/usbnsh'])
        exec_docker(DOCKER_NUTTX_PATH, ['make', 'clean'])
        exec_docker(DOCKER_NUTTX_PATH, ['make', 'context'])
        # Build IoT.js
        build_iotjs(buildtype, [
                    '--target-arch=arm',
                    '--target-os=nuttx',
                    '--nuttx-home=' + DOCKER_NUTTX_PATH,
                    '--target-board=stm32f4dis',
                    '--jerry-heaplimit=78',
                    '--profile=test/profiles/nuttx.profile'])
        # Build Nuttx
        if buildtype == "release":
            rflag = 'R=1'
        else:
            rflag = 'R=0'
        exec_docker(DOCKER_NUTTX_PATH, [
                    'make', 'all',
                    'IOTJS_ROOT_DIR=' + DOCKER_IOTJS_PATH, rflag])

@job('tizen')
def job_tizen(options):
    start_container()
    for buildtype in options.BUILDTYPES:
        if buildtype == "debug":
            exec_docker(DOCKER_IOTJS_PATH, [
                        'config/tizen/gbsbuild.sh',
                        '--debug', '--clean'])
        else:
            exec_docker(DOCKER_IOTJS_PATH, ['config/tizen/gbsbuild.sh',
                        '--clean'])

@job('misc')
def job_misc(options):
    # ex.check_run_cmd('tools/check_signed_off.sh', ['--travis'])
    ex.check_run_cmd('tools/check_tidy.py')

@job('host-darwin')
def job_host_darwin(options):
    for buildtype in options.BUILDTYPES:
        for jerry_profile in options.JERRY_PROFILES:
            ex.check_run_cmd('./tools/build.py', [
                            '--run-test=full',
                            '--buildtype=' + buildtype,
                            '--jerry-profile=' + jerry_profile,
                            '--profile=test/profiles/host-darwin.profile'])

@job('coverity')
def job_coverity(options):
    ex.check_run_cmd('./tools/build.py', ['--clean'])

if __name__ == '__main__':
    options = init_options()
    JOBS[os.getenv('OPTS')](options)
