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

#ifndef IOTJS_MODULE_BUFFER_H
#define IOTJS_MODULE_BUFFER_H

size_t iotjs_base64_decode(char** out_buff, const char* src,
                           const size_t srcLen);
size_t iotjs_base64_encode(unsigned char** out_buff, const uint8_t* data,
                           size_t length);
void* iotjs_bufferwrap_data(jerry_value_t bufferwrap);
size_t iotjs_bufferwrap_length(jerry_value_t bufferwrap);

int iotjs_bufferwrap_compare(const jerry_value_t bufferwrap,
                             const jerry_value_t other);

size_t iotjs_bufferwrap_copy(jerry_value_t bufferwrap, const char* src,
                             size_t len);

// Fail-safe creation of Buffer object.
jerry_value_t iotjs_bufferwrap_create_buffer(size_t len);


#endif /* IOTJS_MODULE_BUFFER_H */
