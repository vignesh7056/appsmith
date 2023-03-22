package com.external.config;

import com.appsmith.external.exceptions.pluginExceptions.AppsmithPluginException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FileListMethodTest {

    @Test
    public void testTransformExecutionResponse_missingJSON_throwsException() {
        ObjectMapper objectMapper = new ObjectMapper();

        FileListMethod fileListMethod = new FileListMethod(objectMapper);
        assertThrows(AppsmithPluginException.class, () -> {
            fileListMethod.transformExecutionResponse(null, null, null);
        });
    }

    @Test
    public void testTransformExecutionResponse_missingFiles_returnsEmpty() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"key1\":\"value1\",\"key2\":\"value2\"}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);

        assertNotNull(jsonNode);

        FileListMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformExecutionResponse(jsonNode, null, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertEquals(0, result.size());
    }

    @Test
    public void testTransformExecutionResponse_emptyFiles_returnsEmpty() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"key1\":\"value1\",\"files\":[]}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);

        assertNotNull(jsonNode);

        FileListMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformExecutionResponse(jsonNode, null, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertEquals(0, result.size());
    }

    @Test
    public void testTransformExecutionResponse_validFiles_toListOfFiles() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"key1\":\"value1\",\"files\":[{\"id\":\"1\", \"name\":\"test\"}]}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);

        assertNotNull(jsonNode);

        FileListMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformExecutionResponse(jsonNode, null, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertTrue("Test".equalsIgnoreCase(result.get(0).get("name").asText()));
    }

    @Test
    public void testTransformTriggerResponse_withoutFiles_returnsEmpty() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"key\":\"value\"}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);
        assertNotNull(jsonNode);

        MethodConfig methodConfig = new MethodConfig(new HashMap<>());

        TriggerMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformTriggerResponse(jsonNode, methodConfig, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertTrue(result.isEmpty());
    }

    @Test
    public void testTransformTriggerResponse_withSheets_returnsDropdownOptions() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"files\":[{\"id\": \"testId\", \"name\": \"testName\"}]}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);
        assertNotNull(jsonNode);

        MethodConfig methodConfig = new MethodConfig(new HashMap<>());

        TriggerMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformTriggerResponse(jsonNode, methodConfig, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        final ObjectNode expectedObjectNode = objectMapper.createObjectNode();
        expectedObjectNode.put("label", "testName");
        expectedObjectNode.put("value", "https://docs.google.com/spreadsheets/d/testId/edit");
        assertEquals(expectedObjectNode, result.get(0));
    }

    @Test
    public void testTransformTriggerResponse_withAllSheetsAccess_returnsAllSheets() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"files\":[{\"id\":\"id1\",\"name\":\"test1\"},{\"id\":\"id2\",\"name\":\"test2\"}]}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);
        assertNotNull(jsonNode);

        MethodConfig methodConfig = new MethodConfig(new HashMap<>());

        TriggerMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformTriggerResponse(jsonNode, methodConfig, null);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertEquals(result.size(), 2);
    }

    @Test
    public void testTransformTriggerResponse_withSpecificSheets_returnsSpecificSheets() throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        final String jsonString = "{\"files\":[{\"id\":\"id1\",\"name\":\"test1\"},{\"id\":\"id2\",\"name\":\"test2\"}]}";

        JsonNode jsonNode = objectMapper.readTree(jsonString);
        Set<String> allowedFileIds = new HashSet<String>();
        allowedFileIds.add("id1");
        assertNotNull(jsonNode);

        MethodConfig methodConfig = new MethodConfig(new HashMap<>());

        TriggerMethod fileListMethod = new FileListMethod(objectMapper);
        JsonNode result = fileListMethod.transformTriggerResponse(jsonNode, methodConfig, allowedFileIds);

        assertNotNull(result);
        assertTrue(result.isArray());
        assertEquals(result.size(), 1);

        final ObjectNode expectedObjectNode = objectMapper.createObjectNode();
        expectedObjectNode.put("label", "test1");
        expectedObjectNode.put("value", "https://docs.google.com/spreadsheets/d/id1/edit");
        assertEquals(expectedObjectNode, result.get(0));
    }
}
