/* Copyright 2015-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "node_api.h"

#if !defined BUILDING_NODE_EXTENSION
#include "jerryscript.h"

EXTERN_C_START
jerry_value_t napi_module_init_static(napi_module* mod);
EXTERN_C_END

#define NAPI_MODULE_STATIC_FUNCTION_NAME_EXPAND(prefix, name, suffix) \
  prefix##name##suffix

#define NAPI_MODULE_STATIC_FUNCTION_NAME(prefix, name, suffix) \
  NAPI_MODULE_STATIC_FUNCTION_NAME_EXPAND(prefix, name, suffix)

#define NAPI_MODULE_STATIC(modname, regfunc)                         \
  NAPI_MODULE_X(modname, regfunc, NULL, 1)                           \
  EXTERN_C_START                                                     \
  jerry_value_t NAPI_MODULE_STATIC_FUNCTION_NAME(iotjs_, modname,    \
                                                 _napi_init)(void) { \
    return napi_module_init_static(&_module);                        \
  }                                                                  \
  EXTERN_C_END
#else
#define NAPI_MODULE_STATIC(modname, regfunc) \
  NAPI_MODULE_X(modname, regfunc, NULL, 0)
#endif
